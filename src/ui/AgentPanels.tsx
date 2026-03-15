import { useState, useRef } from "react";
import { fitnessDesignerAgent } from "../agents/fitnessDesigner";
import { mutationAdvisorAgent } from "../agents/mutationAdvisor";
import type { PopulationStats, AdvisorAdvice } from "../agents/mutationAdvisor";
import { narratorAgent } from "../agents/narrator";
import { survivalFitness } from "../core/Fitness";
import type { FitnessFunction, WorldState } from "../core/types";

interface Props {
  world: WorldState;
  onFitnessChange: (fn: FitnessFunction) => void;
  onConfigChange: (patch: Partial<{ mutationRate: number; crossoverType: "single-point" | "two-point" | "uniform" }>) => void;
}

function buildStats(world: WorldState): PopulationStats {
  const alive = world.organisms.filter((o) => o.alive);
  const fitnesses = alive.map((o) => survivalFitness(o, world));
  const avg = fitnesses.length > 0 ? fitnesses.reduce((a, b) => a + b, 0) / fitnesses.length : 0;
  const max = fitnesses.length > 0 ? Math.max(...fitnesses) : 0;
  const min = fitnesses.length > 0 ? Math.min(...fitnesses) : 0;
  const variance = fitnesses.length > 0
    ? fitnesses.reduce((a, b) => a + (b - avg) ** 2, 0) / fitnesses.length
    : 0;
  const topGenomes = alive
    .map((o, i) => ({ o, f: fitnesses[i] }))
    .sort((a, b) => b.f - a.f)
    .slice(0, 10)
    .map(({ o }) => o.genome.filter((g): g is number => typeof g === "number"));

  return {
    generation: world.generation,
    populationSize: alive.length,
    avgFitness: avg,
    maxFitness: max,
    minFitness: min,
    fitnessStdDev: Math.sqrt(variance),
    topGenomes,
  };
}

export function AgentPanels({ world, onFitnessChange, onConfigChange }: Props) {
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [fitnessStatus, setFitnessStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [fitnessError, setFitnessError] = useState<string | null>(null);

  const [advisorStatus, setAdvisorStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [advice, setAdvice] = useState<AdvisorAdvice | null>(null);
  const [advisorError, setAdvisorError] = useState<string | null>(null);

  const [narratorStatus, setNarratorStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [diaryEntries, setDiaryEntries] = useState<string[]>([]);
  const prevWorldRef = useRef<WorldState>(world);

  async function handleDesignFitness() {
    if (!fitnessGoal.trim()) return;
    setFitnessStatus("loading");
    setFitnessError(null);
    try {
      const fn = await fitnessDesignerAgent(fitnessGoal);
      onFitnessChange(fn);
      setFitnessStatus("ok");
    } catch (e) {
      setFitnessStatus("error");
      setFitnessError(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleAdvise() {
    setAdvisorStatus("loading");
    setAdvisorError(null);
    try {
      const stats = buildStats(world);
      const result = await mutationAdvisorAgent(stats);
      setAdvice(result);
      onConfigChange({ mutationRate: result.mutationRate, crossoverType: result.crossoverType });
      setAdvisorStatus("ok");
    } catch (e) {
      setAdvisorStatus("error");
      setAdvisorError(e instanceof Error ? e.message : String(e));
    }
  }

  async function handleNarrate() {
    setNarratorStatus("loading");
    try {
      const entry = await narratorAgent(prevWorldRef.current, world);
      setDiaryEntries((prev) => [entry.text, ...prev].slice(0, 10));
      prevWorldRef.current = world;
      setNarratorStatus("ok");
    } catch (e) {
      setNarratorStatus("error");
      console.error("Narrator error:", e);
    }
  }

  const anyLoading = fitnessStatus === "loading" || advisorStatus === "loading" || narratorStatus === "loading";

  return (
    <div style={{ borderTop: "1px solid #333", paddingTop: 12, marginTop: 12 }}>
      <h2 style={{ fontSize: "0.9rem", marginTop: 0 }}>AI Agents</h2>

      {/* Fitness Designer */}
      <section style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: "0.8rem", margin: "0 0 6px" }}>🧪 Fitness Designer</h3>
        <textarea
          value={fitnessGoal}
          onChange={(e) => setFitnessGoal(e.target.value)}
          placeholder="e.g. reward organisms near the centre"
          rows={2}
          style={{ width: "100%", fontSize: "0.75rem", boxSizing: "border-box", background: "#222", color: "#eee", border: "1px solid #444" }}
        />
        <button onClick={handleDesignFitness} disabled={anyLoading || !fitnessGoal.trim()} style={{ marginTop: 4, fontSize: "0.75rem" }}>
          {fitnessStatus === "loading" ? "Generating…" : "Generate"}
        </button>
        {fitnessStatus === "ok" && <p style={{ fontSize: "0.7rem", color: "#4ade80", margin: "4px 0 0" }}>✓ Fitness applied</p>}
        {fitnessError && <p style={{ fontSize: "0.7rem", color: "#f87171", margin: "4px 0 0" }}>{fitnessError}</p>}
        <button
          onClick={() => { onFitnessChange(survivalFitness); setFitnessStatus("idle"); setFitnessGoal(""); }}
          style={{ fontSize: "0.7rem", marginTop: 4, opacity: 0.6 }}
        >
          Reset to default
        </button>
      </section>

      {/* Mutation Advisor */}
      <section style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: "0.8rem", margin: "0 0 6px" }}>🔬 Mutation Advisor</h3>
        <button onClick={handleAdvise} disabled={anyLoading} style={{ fontSize: "0.75rem" }}>
          {advisorStatus === "loading" ? "Analysing…" : "Diagnose"}
        </button>
        {advisorError && <p style={{ fontSize: "0.7rem", color: "#f87171", margin: "4px 0 0" }}>{advisorError}</p>}
        {advice && (
          <div style={{ fontSize: "0.7rem", marginTop: 6, color: "#ccc" }}>
            <p style={{ margin: "2px 0" }}>mutationRate → <strong>{advice.mutationRate.toFixed(3)}</strong></p>
            <p style={{ margin: "2px 0" }}>crossover → <strong>{advice.crossoverType}</strong></p>
            <p style={{ margin: "4px 0 0", fontStyle: "italic" }}>{advice.explanation}</p>
          </div>
        )}
      </section>

      {/* Narrator */}
      <section>
        <h3 style={{ fontSize: "0.8rem", margin: "0 0 6px" }}>📖 Narrator</h3>
        <button onClick={handleNarrate} disabled={anyLoading} style={{ fontSize: "0.75rem" }}>
          {narratorStatus === "loading" ? "Writing…" : "Write diary entry"}
        </button>
        {diaryEntries.map((entry, i) => (
          <p key={i} style={{ fontSize: "0.7rem", marginTop: 8, color: "#ccc", borderLeft: "2px solid #555", paddingLeft: 8 }}>
            {entry}
          </p>
        ))}
      </section>
    </div>
  );
}

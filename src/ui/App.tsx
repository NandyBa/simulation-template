import { useState, useEffect, useRef, useCallback } from "react";
import { SimCanvas } from "./SimCanvas";
import { ControlPanel } from "./ControlPanel";
import { StatsDashboard } from "./StatsDashboard";
import { GenomeInspector } from "./GenomeInspector";
import { AgentPanels } from "./AgentPanels";
import { useStatsHistory } from "./useStatsHistory";
import { createWorld, tick, createConfig, defaultConfig } from "../core/World";
import { survivalFitness } from "../core/Fitness";
import type { FitnessFunction, MoveFn, Organism, SimConfig, WorldState } from "../core/types";
import { PRESETS } from "../presets/index";

export default function App() {
  const [world, setWorld] = useState<WorldState>(() => createWorld(defaultConfig));
  const [selected, setSelected] = useState<Organism | null>(null);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [fitnessFn, setFitnessFn] = useState<FitnessFunction>(() => survivalFitness);
  const [presetId, setPresetId] = useState("default");
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fitnessFnRef = useRef<FitnessFunction>(survivalFitness);
  const moveFnRef = useRef<MoveFn | undefined>(undefined);
  const { history, reset: resetHistory } = useStatsHistory(world);

  useEffect(() => { fitnessFnRef.current = fitnessFn; }, [fitnessFn]);

  function handlePresetChange(id: string) {
    const preset = PRESETS.find((p) => p.id === id);
    if (!preset) return;
    setRunning(false);
    setPresetId(id);
    setFitnessFn(() => preset.fitnessFn);
    fitnessFnRef.current = preset.fitnessFn;
    moveFnRef.current = preset.moveFn;
    setWorld(createWorld(preset.config));
    resetHistory();
    setSelected(null);
  }

  const step = useCallback(() => {
    setWorld((w) => { try { return tick(w, fitnessFnRef.current, moveFnRef.current); } catch { return w; } });
  }, []);

  useEffect(() => {
    if (!running) { if (rafRef.current) clearTimeout(rafRef.current); return; }
    const schedule = () => {
      rafRef.current = setTimeout(() => {
        setWorld((w) => { try { return tick(w, fitnessFnRef.current, moveFnRef.current); } catch { return w; } });
        schedule();
      }, speed);
    };
    schedule();
    return () => { if (rafRef.current) clearTimeout(rafRef.current); };
  }, [running, speed]);

  useEffect(() => {
    if (!selected) return;
    const updated = world.organisms.find((o) => o.id === selected.id);
    setSelected(updated ?? null);
  }, [world, selected]);

  function handleReset() {
    const preset = PRESETS.find((p) => p.id === presetId) ?? PRESETS[0];
    setRunning(false);
    setFitnessFn(() => preset.fitnessFn);
    fitnessFnRef.current = preset.fitnessFn;
    moveFnRef.current = preset.moveFn;
    setWorld(createWorld(preset.config));
    resetHistory();
    setSelected(null);
  }

  function handleConfigChange(patch: Partial<SimConfig>) {
    setWorld((w) => {
      try {
        const newConfig = createConfig({ ...w.config, ...patch });
        return { ...w, config: newConfig };
      } catch {
        return w;
      }
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#0d0d0d", color: "#eee", fontFamily: "system-ui, sans-serif" }}>
      {/* Header */}
      <header style={{ padding: "6px 16px", borderBottom: "1px solid #2a2a2a", display: "flex", alignItems: "center", gap: 12, background: "#141414" }}>
        <h1 style={{ margin: 0, fontSize: "1rem", letterSpacing: "0.08em", color: "#4ade80" }}>GENSIM</h1>
        <span style={{ fontSize: "0.7rem", color: "#555" }}>genetic algorithm simulation engine</span>
        <div style={{ marginLeft: "auto", fontSize: "0.7rem", color: "#555" }}>
          gen <strong style={{ color: "#eee" }}>{world.generation}</strong>
          {" · "}tick <strong style={{ color: "#eee" }}>{world.tick}</strong>
          {" · "}
          <span style={{ color: world.organisms.filter(o => o.alive).length > 0 ? "#4ade80" : "#f87171" }}>
            {world.organisms.filter(o => o.alive).length} alive
          </span>
        </div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* Left sidebar — controls */}
        <aside style={{ width: 220, borderRight: "1px solid #2a2a2a", padding: 12, background: "#111", display: "flex", flexDirection: "column", gap: 0 }}>
          <div style={{ marginBottom: 12 }}>
            <p style={{ margin: "0 0 4px", fontSize: "0.7rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>Preset</p>
            <select
              value={presetId}
              onChange={(e) => handlePresetChange(e.target.value)}
              style={{ width: "100%", background: "#1e1e1e", color: "#eee", border: "1px solid #333", borderRadius: 4, padding: "4px 6px", fontSize: "0.8rem" }}
            >
              {PRESETS.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <p style={{ margin: "4px 0 0", fontSize: "0.65rem", color: "#555" }}>
              {PRESETS.find((p) => p.id === presetId)?.description}
            </p>
          </div>
          <ControlPanel
            world={world}
            running={running}
            speed={speed}
            onToggleRun={() => setRunning((r) => !r)}
            onReset={handleReset}
            onStep={step}
            onSpeedChange={setSpeed}
          />
        </aside>

        {/* Canvas */}
        <main style={{ flex: 1, overflow: "hidden", position: "relative", background: "#0d0d0d" }}>
          <SimCanvas world={world} onSelectOrganism={setSelected} />
          {selected && (
            <div style={{ position: "absolute", bottom: 12, left: 12, background: "#141414", border: "1px solid #333", borderRadius: 6, padding: "8px 12px", fontSize: "0.7rem", color: "#ccc", maxWidth: 200 }}>
              <strong style={{ color: "#eee" }}>{selected.id}</strong>
              <div>energy: {selected.energy.toFixed(1)} · age: {selected.age}</div>
              <div style={{ color: "#555" }}>click canvas to deselect</div>
            </div>
          )}
        </main>

        {/* Right sidebar — stats + agents */}
        <aside style={{ width: 300, borderLeft: "1px solid #2a2a2a", padding: 12, background: "#111", overflowY: "auto", display: "flex", flexDirection: "column" }}>
          <StatsDashboard world={world} history={history} />
          {selected && <GenomeInspector organism={selected} world={world} />}
          <AgentPanels
            world={world}
            onFitnessChange={(fn) => setFitnessFn(() => fn)}
            onConfigChange={handleConfigChange}
          />
        </aside>
      </div>
    </div>
  );
}

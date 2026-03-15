import { useState, useEffect, useRef, useCallback } from "react";
import { SimCanvas } from "./SimCanvas";
import { ControlPanel } from "./ControlPanel";
import { StatsDashboard } from "./StatsDashboard";
import { GenomeInspector } from "./GenomeInspector";
import { AgentPanels } from "./AgentPanels";
import { createWorld, tick, createConfig, defaultConfig } from "../core/World";
import { survivalFitness } from "../core/Fitness";
import type { FitnessFunction, Organism, SimConfig, WorldState } from "../core/types";

export default function App() {
  const [world, setWorld] = useState<WorldState>(() => createWorld(defaultConfig));
  const [selected, setSelected] = useState<Organism | null>(null);
  const [running, setRunning] = useState(false);
  const [speed, setSpeed] = useState(100);
  const [fitnessFn, setFitnessFn] = useState<FitnessFunction>(() => survivalFitness);
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fitnessFnRef = useRef<FitnessFunction>(survivalFitness);

  // Keep ref in sync so the tick loop always uses the latest fitness fn
  useEffect(() => { fitnessFnRef.current = fitnessFn; }, [fitnessFn]);

  const step = useCallback(() => {
    setWorld((w) => tick(w, fitnessFnRef.current));
  }, []);

  useEffect(() => {
    if (!running) { if (rafRef.current) clearTimeout(rafRef.current); return; }
    const schedule = () => {
      rafRef.current = setTimeout(() => {
        setWorld((w) => tick(w, fitnessFnRef.current));
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
    <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#111", color: "#eee" }}>
      <header style={{ padding: "8px 16px", borderBottom: "1px solid #333" }}>
        <h1 style={{ margin: 0, fontSize: "1.2rem" }}>GenSim</h1>
      </header>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <aside style={{ width: 240, borderRight: "1px solid #333", padding: 12 }}>
          <ControlPanel
            world={world}
            running={running}
            speed={speed}
            onToggleRun={() => setRunning((r) => !r)}
            onReset={() => { setRunning(false); setWorld(createWorld(defaultConfig)); setFitnessFn(() => survivalFitness); }}
            onStep={step}
            onSpeedChange={setSpeed}
          />
        </aside>
        <main style={{ flex: 1, overflow: "hidden", position: "relative" }}>
          <SimCanvas world={world} onSelectOrganism={setSelected} />
        </main>
        <aside style={{ width: 280, borderLeft: "1px solid #333", padding: 12, overflowY: "auto" }}>
          <StatsDashboard world={world} />
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

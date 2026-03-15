import type { WorldState } from "../core/types";

interface Props {
  world: WorldState;
  running: boolean;
  speed: number;
  onToggleRun: () => void;
  onReset: () => void;
  onStep: () => void;
  onSpeedChange: (ms: number) => void;
}

const btnBase: React.CSSProperties = {
  background: "#1e1e1e",
  border: "1px solid #333",
  color: "#eee",
  padding: "5px 10px",
  borderRadius: 4,
  cursor: "pointer",
  fontSize: "0.8rem",
};

export function ControlPanel({ world: _world, running, speed, onToggleRun, onReset, onStep, onSpeedChange }: Props) {
  return (
    <div>
      <p style={{ margin: "0 0 8px", fontSize: "0.7rem", color: "#555", textTransform: "uppercase", letterSpacing: "0.05em" }}>Controls</p>

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        <button onClick={onToggleRun} style={{ ...btnBase, background: running ? "#1a3a1a" : "#1e1e1e", color: running ? "#4ade80" : "#eee", flex: 1 }}>
          {running ? "⏸ Pause" : "▶ Play"}
        </button>
        <button onClick={onStep} disabled={running} style={{ ...btnBase, opacity: running ? 0.4 : 1 }}>
          Step
        </button>
        <button onClick={onReset} style={{ ...btnBase, color: "#f87171" }}>
          Reset
        </button>
      </div>

      <label style={{ fontSize: "0.75rem", color: "#888", display: "block", marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
          <span>Speed</span>
          <span style={{ color: "#eee" }}>{speed}ms/tick</span>
        </div>
        <input
          type="range" min={16} max={1000} step={16} value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          style={{ width: "100%", accentColor: "#4ade80" }}
        />
      </label>
    </div>
  );
}

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

export function ControlPanel({ world, running, speed, onToggleRun, onReset, onStep, onSpeedChange }: Props) {
  return (
    <div>
      <h2 style={{ fontSize: "0.9rem", marginTop: 0 }}>Controls</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={onToggleRun}>{running ? "Pause" : "Play"}</button>
        <button onClick={onStep} disabled={running}>Step</button>
        <button onClick={onReset}>Reset</button>
      </div>
      <label style={{ fontSize: "0.8rem", display: "block", marginBottom: 12 }}>
        Speed: {speed}ms/tick
        <input
          type="range"
          min={16}
          max={1000}
          step={16}
          value={speed}
          onChange={(e) => onSpeedChange(Number(e.target.value))}
          style={{ width: "100%", display: "block" }}
        />
      </label>
      <dl style={{ fontSize: "0.8rem", margin: 0 }}>
        <dt>Generation</dt><dd>{world.generation}</dd>
        <dt>Tick</dt><dd>{world.tick}</dd>
        <dt>Population</dt><dd>{world.organisms.filter((o) => o.alive).length}</dd>
      </dl>
    </div>
  );
}

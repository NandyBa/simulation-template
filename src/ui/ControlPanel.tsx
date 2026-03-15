import type { WorldState } from "../core/types";

interface Props {
  world: WorldState;
  running: boolean;
  onToggleRun: () => void;
  onReset: () => void;
  onStep: () => void;
}

export function ControlPanel({ world, running, onToggleRun, onReset, onStep }: Props) {
  return (
    <div>
      <h2 style={{ fontSize: "0.9rem", marginTop: 0 }}>Controls</h2>
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button onClick={onToggleRun}>{running ? "Pause" : "Play"}</button>
        <button onClick={onStep} disabled={running}>Step</button>
        <button onClick={onReset}>Reset</button>
      </div>
      <dl style={{ fontSize: "0.8rem", margin: 0 }}>
        <dt>Generation</dt><dd>{world.generation}</dd>
        <dt>Tick</dt><dd>{world.tick}</dd>
        <dt>Population</dt><dd>{world.organisms.filter((o) => o.alive).length}</dd>
      </dl>
    </div>
  );
}

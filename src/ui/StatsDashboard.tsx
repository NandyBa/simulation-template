import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { WorldState } from "../core/types";

interface Props {
  world: WorldState;
}

export function StatsDashboard({ world }: Props) {
  const alive = world.organisms.filter((o) => o.alive);
  const avgEnergy =
    alive.length > 0
      ? alive.reduce((s, o) => s + o.energy, 0) / alive.length
      : 0;

  // TODO: accumulate history across ticks for real charting
  const data = [{ tick: world.tick, population: alive.length, avgEnergy }];

  return (
    <div>
      <h2 style={{ fontSize: "0.9rem", marginTop: 0 }}>Stats</h2>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data}>
          <XAxis dataKey="tick" hide />
          <YAxis hide />
          <Tooltip />
          <Line type="monotone" dataKey="population" stroke="#4ade80" dot={false} />
          <Line type="monotone" dataKey="avgEnergy" stroke="#60a5fa" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

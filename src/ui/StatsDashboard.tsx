import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid, Legend,
} from "recharts";
import type { StatPoint } from "./useStatsHistory";
import type { WorldState } from "../core/types";

interface Props {
  world: WorldState;
  history: StatPoint[];
}

const CHART_HEIGHT = 110;
const COLORS = {
  population: "#4ade80",
  avgEnergy: "#60a5fa",
  maxEnergy: "#f59e0b",
  minEnergy: "#f87171",
  avgAge: "#c084fc",
};

function MiniChart({
  data,
  lines,
  title,
}: {
  data: StatPoint[];
  lines: { key: keyof StatPoint; color: string; label: string }[];
  title: string;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ margin: "0 0 4px", fontSize: "0.75rem", color: "#999", textTransform: "uppercase", letterSpacing: "0.05em" }}>
        {title}
      </p>
      <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
        <LineChart data={data} margin={{ top: 2, right: 4, bottom: 2, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#222" />
          <XAxis dataKey="tick" hide />
          <YAxis width={32} tick={{ fontSize: 9, fill: "#666" }} />
          <Tooltip
            contentStyle={{ background: "#1a1a1a", border: "1px solid #333", fontSize: "0.7rem" }}
            labelFormatter={(v) => `tick ${v}`}
          />
          <Legend wrapperStyle={{ fontSize: "0.65rem" }} />
          {lines.map(({ key, color, label }) => (
            <Line
              key={key}
              type="monotone"
              dataKey={key}
              stroke={color}
              dot={false}
              strokeWidth={1.5}
              name={label}
              isAnimationActive={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export function StatsDashboard({ world, history }: Props) {
  const alive = world.organisms.filter((o) => o.alive);
  const latest = history[history.length - 1];

  return (
    <div style={{ borderBottom: "1px solid #333", paddingBottom: 12, marginBottom: 12 }}>
      <h2 style={{ fontSize: "0.9rem", marginTop: 0, marginBottom: 8 }}>Stats</h2>

      {/* Live counters */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 12px", fontSize: "0.75rem", marginBottom: 12 }}>
        {[
          ["Generation", world.generation],
          ["Tick", world.tick],
          ["Population", alive.length],
          ["Avg energy", latest ? latest.avgEnergy.toFixed(1) : "—"],
          ["Max energy", latest ? latest.maxEnergy.toFixed(1) : "—"],
          ["Avg age", latest ? latest.avgAge.toFixed(1) : "—"],
        ].map(([label, value]) => (
          <div key={label as string}>
            <span style={{ color: "#666" }}>{label} </span>
            <span style={{ color: "#eee", fontWeight: 600 }}>{value}</span>
          </div>
        ))}
      </div>

      {history.length > 1 ? (
        <>
          <MiniChart
            title="Population"
            data={history}
            lines={[{ key: "population", color: COLORS.population, label: "alive" }]}
          />
          <MiniChart
            title="Energy"
            data={history}
            lines={[
              { key: "maxEnergy", color: COLORS.maxEnergy, label: "max" },
              { key: "avgEnergy", color: COLORS.avgEnergy, label: "avg" },
              { key: "minEnergy", color: COLORS.minEnergy, label: "min" },
            ]}
          />
          <MiniChart
            title="Avg Age"
            data={history}
            lines={[{ key: "avgAge", color: COLORS.avgAge, label: "age" }]}
          />
        </>
      ) : (
        <p style={{ fontSize: "0.7rem", color: "#555", margin: 0 }}>
          Run the simulation to see live graphs…
        </p>
      )}
    </div>
  );
}

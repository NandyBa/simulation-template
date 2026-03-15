import { useState } from "react";
import type { WorldState } from "../core/types";

interface Props {
  world: WorldState;
  onConfigChange: (patch: Record<string, unknown>) => void;
}

export function AgentPanels({ world, onConfigChange: _onConfigChange }: Props) {
  const [fitnessGoal, setFitnessGoal] = useState("");
  const [narratorText, setNarratorText] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleDesignFitness() {
    if (!fitnessGoal.trim()) return;
    setLoading(true);
    try {
      // TODO: wire to fitnessDesignerAgent
      console.log("Fitness goal submitted:", fitnessGoal);
    } finally {
      setLoading(false);
    }
  }

  async function handleNarrate() {
    setLoading(true);
    try {
      // TODO: wire to narratorAgent
      setNarratorText(`Generation ${world.generation}: evolution unfolds...`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 style={{ fontSize: "0.9rem" }}>AI Agents</h2>

      <section style={{ marginBottom: 16 }}>
        <h3 style={{ fontSize: "0.8rem" }}>Fitness Designer</h3>
        <textarea
          value={fitnessGoal}
          onChange={(e) => setFitnessGoal(e.target.value)}
          placeholder="Describe a fitness goal..."
          rows={3}
          style={{ width: "100%", fontSize: "0.8rem" }}
        />
        <button onClick={handleDesignFitness} disabled={loading}>
          Generate
        </button>
      </section>

      <section>
        <h3 style={{ fontSize: "0.8rem" }}>Narrator</h3>
        <button onClick={handleNarrate} disabled={loading}>
          Generate diary entry
        </button>
        {narratorText && (
          <p style={{ fontSize: "0.75rem", marginTop: 8, color: "#ccc" }}>
            {narratorText}
          </p>
        )}
      </section>
    </div>
  );
}

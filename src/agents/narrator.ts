import { callSubAgent } from "./callSubAgent";
import type { WorldState } from "../core/types";

export interface NarratorEntry {
  generation: number;
  text: string;
}

const SYSTEM_PROMPT = `You are an evolution narrator for a genetic algorithm simulation.
Given two world snapshots (before and after), write a short (2–3 sentence) diary entry
describing what happened: population changes, dominant traits, extinctions, breakthroughs.
Write in an engaging, slightly dramatic tone. Plain text only — no markdown.`;

/**
 * Produces a natural-language diary entry describing evolution between two snapshots.
 */
export async function narratorAgent(
  before: WorldState,
  after: WorldState
): Promise<NarratorEntry> {
  const diff = {
    generationBefore: before.generation,
    generationAfter: after.generation,
    populationBefore: before.organisms.filter((o) => o.alive).length,
    populationAfter: after.organisms.filter((o) => o.alive).length,
    ticksBefore: before.tick,
    ticksAfter: after.tick,
  };

  return callSubAgent(
    SYSTEM_PROMPT,
    JSON.stringify(diff),
    (raw) => ({ generation: after.generation, text: raw.trim() })
  );
}

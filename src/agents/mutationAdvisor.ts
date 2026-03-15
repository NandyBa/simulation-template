import { callSubAgent } from "./callSubAgent";

export interface PopulationStats {
  generation: number;
  populationSize: number;
  avgFitness: number;
  maxFitness: number;
  minFitness: number;
  fitnessStdDev: number;
  topGenomes: number[][];
}

export interface AdvisorAdvice {
  mutationRate: number;
  crossoverType: "single-point" | "two-point" | "uniform";
  selectionPressure: "low" | "medium" | "high";
  explanation: string;
}

const SYSTEM_PROMPT = `You are a genetic algorithm tuning advisor.
Given population statistics, recommend parameter changes to improve evolution.
Respond with a single JSON object (no markdown, no code fences) with these fields:
- mutationRate: number between 0 and 1
- crossoverType: "single-point" | "two-point" | "uniform"
- selectionPressure: "low" | "medium" | "high"
- explanation: one sentence explaining why`;

/**
 * Analyses population stats and recommends parameter tweaks.
 */
export async function mutationAdvisorAgent(
  stats: PopulationStats
): Promise<AdvisorAdvice> {
  return callSubAgent(
    SYSTEM_PROMPT,
    JSON.stringify(stats),
    (raw) => {
      const advice = JSON.parse(raw) as AdvisorAdvice;
      if (typeof advice.mutationRate !== "number") throw new Error("invalid advice shape");
      if (advice.mutationRate < 0 || advice.mutationRate > 1)
        throw new Error("mutationRate out of bounds");
      return advice;
    }
  );
}

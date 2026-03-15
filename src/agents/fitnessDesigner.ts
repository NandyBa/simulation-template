import { callSubAgent } from "./callSubAgent";
import { sandboxFitnessFunction } from "./sandbox";
import type { FitnessFunction } from "../core/types";

const SYSTEM_PROMPT = `You are a genetic algorithm fitness function designer.
The user will describe a fitness goal in plain English.
Respond with ONLY a valid JavaScript function body (no function signature, no markdown).
The function body receives two arguments: \`organism\` and \`world\`.
Return a non-negative number. Higher values mean more fit.
The organism has: id, genome, position ([x,y]), energy, age, traits, alive.
The world has: grid, organisms, generation, tick, config.
Do not use any external APIs, eval, or side effects.`;

/**
 * Translates a plain-English fitness goal into a sandboxed FitnessFunction.
 */
export async function fitnessDesignerAgent(
  goal: string
): Promise<FitnessFunction> {
  return callSubAgent(
    SYSTEM_PROMPT,
    goal,
    (raw) => sandboxFitnessFunction(raw.trim())
  );
}

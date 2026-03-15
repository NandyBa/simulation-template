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
 * Strips markdown code fences and function signatures that local models
 * sometimes include despite being told not to.
 */
function extractFunctionBody(raw: string): string {
  // Remove ```javascript ... ``` or ``` ... ``` fences
  let body = raw.replace(/^```[a-z]*\n?/m, "").replace(/\n?```$/m, "").trim();
  // Remove leading function signature like "function foo(organism, world) {"
  // and its matching closing brace
  body = body.replace(/^function\s+\w+\s*\([^)]*\)\s*\{/, "").replace(/\}$/, "").trim();
  return body;
}

export interface FitnessDesignerResult {
  fn: FitnessFunction;
  body: string;
}

/**
 * Translates a plain-English fitness goal into a sandboxed FitnessFunction.
 * Returns both the function and the extracted body for display.
 */
export async function fitnessDesignerAgent(
  goal: string
): Promise<FitnessDesignerResult> {
  return callSubAgent(
    SYSTEM_PROMPT,
    goal,
    (raw) => {
      const body = extractFunctionBody(raw);
      return { fn: sandboxFitnessFunction(body), body };
    }
  );
}

import type { FitnessFunction } from "../core/types";

const FORBIDDEN_PATTERNS = [
  /world\s*\[/,           // direct world mutation via bracket access
  /organisms\s*=/,        // reassigning organisms array
  /grid\s*=/,             // reassigning grid
  /\beval\b/,             // eval
  /\bFunction\b/,         // Function constructor
  /\brequire\b/,          // require
  /\bimport\b/,           // dynamic import
  /\bprocess\b/,          // node process
  /\bfetch\b/,            // network calls
  /\bXMLHttpRequest\b/,   // network calls
];

/**
 * Validates that a generated function body string contains no unsafe patterns.
 * Throws if any forbidden pattern is detected.
 */
export function validateFunctionBody(body: string): void {
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(body)) {
      throw new Error(`unsafe pattern detected in generated function: ${pattern}`);
    }
  }
}

/**
 * Wraps a raw function body string into a sandboxed FitnessFunction.
 * Throws if the body contains unsafe patterns or fails to compile.
 */
export function sandboxFitnessFunction(body: string): FitnessFunction {
  validateFunctionBody(body);
  try {
    // eslint-disable-next-line no-new-func
    const fn = new Function("organism", "world", body) as FitnessFunction;
    return fn;
  } catch {
    throw new Error("generated function body failed to compile");
  }
}

import type { FitnessFunction } from "./types";

/** Rewards organisms for having high energy */
export const survivalFitness: FitnessFunction = (organism) => {
  const score = organism.energy * (organism.alive ? 1 : 0);
  return Number.isFinite(score) ? Math.max(0, score) : 0;
};

/** Rewards organisms for longevity */
export const longevityFitness: FitnessFunction = (organism) => {
  const score = organism.age * (organism.alive ? 1 : 0);
  return Number.isFinite(score) ? Math.max(0, score) : 0;
};

/** Composite: weighted sum of multiple fitness functions */
export function compositeFitness(
  fns: FitnessFunction[],
  weights: number[]
): FitnessFunction {
  return (organism, world) => {
    let total = 0;
    for (let i = 0; i < fns.length; i++) {
      const score = fns[i](organism, world);
      total += (weights[i] ?? 1) * (Number.isFinite(score) ? score : 0);
    }
    return Math.max(0, total);
  };
}

/** Validates that a fitness function never returns NaN/Infinity */
export function safeFitness(fn: FitnessFunction): FitnessFunction {
  return (organism, world) => {
    const score = fn(organism, world);
    if (!Number.isFinite(score)) return 0;
    return Math.max(0, score);
  };
}

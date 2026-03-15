import { defaultConfig } from "../core/World";
import type { FitnessFunction, SimConfig } from "../core/types";

/**
 * Empty scaffold for user-defined simulations.
 * Replace the fitness function and config to define your own simulation.
 */
export const customFitness: FitnessFunction = (organism, _world) => {
  // Define your fitness logic here.
  // Return a non-negative number — higher = more fit.
  return organism.energy;
};

export const customConfig: SimConfig = {
  ...defaultConfig,
  seed: Date.now(),
};

import { createConfig } from "../core/World";
import type { FitnessFunction, SimConfig } from "../core/types";

/**
 * Classic Conway's Game of Life encoded as genome-driven behaviour.
 * Each organism's genome encodes its neighbourhood survival rules.
 */
export const gameOfLifeFitness: FitnessFunction = (organism, world) => {
  // TODO: count living neighbours and reward stable patterns
  return organism.alive ? organism.age : 0;
};

export const gameOfLifeConfig: SimConfig = createConfig({
  width: 40,
  height: 40,
  populationSize: 80,
  carryingCapacity: 400,
  mutationRate: 0.005,
  crossoverRate: 0.6,
  crossoverType: "single-point",
  selectionType: "tournament",
  elitismCount: 4,
  tournamentSize: 3,
  genomeSchema: {
    length: 9, // 8 neighbour bits + 1 self bit
    genes: Array(9).fill({ type: "boolean" }),
  },
  energyPerTick: 0,
  reproductionThreshold: 3,
  seed: 42,
});

import { createConfig } from "../core/World";
import type { FitnessFunction, SimConfig } from "../core/types";

/**
 * Organisms evolve to navigate a maze from start to goal.
 * Fitness rewards proximity to the goal position.
 */
export const pathfinderFitness: FitnessFunction = (organism, world) => {
  // TODO: calculate Manhattan distance to goal, reward minimisation
  const goalX = world.config.width - 1;
  const goalY = world.config.height - 1;
  const [x, y] = organism.position;
  const distance = Math.abs(goalX - x) + Math.abs(goalY - y);
  const maxDist = world.config.width + world.config.height;
  return organism.alive ? Math.max(0, maxDist - distance) : 0;
};

export const pathfinderConfig: SimConfig = createConfig({
  width: 20,
  height: 20,
  populationSize: 40,
  carryingCapacity: 100,
  mutationRate: 0.03,
  crossoverRate: 0.8,
  crossoverType: "uniform",
  selectionType: "rank",
  elitismCount: 2,
  tournamentSize: 3,
  genomeSchema: {
    length: 20, // sequence of move directions
    genes: Array(20).fill({
      type: "string",
      options: ["N", "S", "E", "W"],
    }),
  },
  energyPerTick: 1,
  reproductionThreshold: 120,
  seed: 13,
});

import { createConfig } from "../core/World";
import type { FitnessFunction, MoveFn, SimConfig } from "../core/types";

const DIRS: Record<string, [number, number]> = {
  N: [0, -1],
  S: [0, 1],
  E: [1, 0],
  W: [-1, 0],
};
const FALLBACK: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];

/**
 * Genome-driven movement: genome[tick % genomeLength] picks the preferred
 * direction. Returns the preferred direction first, then the rest as fallbacks
 * so the organism always moves if any adjacent cell is free.
 */
export const pathfinderMoveFn: MoveFn = (organism, tick) => {
  const gene = organism.genome[tick % organism.genome.length];
  const preferred = typeof gene === "string" ? (DIRS[gene] ?? FALLBACK[0]) : FALLBACK[0];
  const others = FALLBACK.filter(([dx, dy]) => dx !== preferred[0] || dy !== preferred[1]);
  return [preferred, ...others];
};

/**
 * Rewards proximity to the goal (bottom-right corner).
 * Max score when the organism is at the goal; 0 when at max Manhattan distance.
 */
export const pathfinderFitness: FitnessFunction = (organism, world) => {
  if (!organism.alive) return 0;
  const goalX = world.config.width - 1;
  const goalY = world.config.height - 1;
  const [x, y] = organism.position;
  const distance = Math.abs(goalX - x) + Math.abs(goalY - y);
  const maxDist = world.config.width + world.config.height - 2;
  return Math.max(0, maxDist - distance) + organism.age * 0.05;
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
  energyGainPerTick: 2,
  reproductionThreshold: 120,
  seed: 13,
});

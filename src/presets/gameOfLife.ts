import { createConfig } from "../core/World";
import type { FitnessFunction, SimConfig } from "../core/types";

/**
 * Conway's Game of Life encoded as genome-driven survival rules.
 *
 * Genome: 9 boolean genes — gene[i] = "survive when i live neighbours".
 * Classic Conway genome: gene[2]=true, gene[3]=true, rest=false.
 *
 * Fitness rewards organisms whose genome says they should survive given their
 * current neighbourhood. Extra bonus for organisms in the canonical GoL
 * survival zone (2–3 neighbours) regardless of genome, so naive random
 * genomes still see selection pressure toward stable clusters.
 */
export const gameOfLifeFitness: FitnessFunction = (organism, world) => {
  if (!organism.alive) return 0;
  const [x, y] = organism.position;
  const { width, height } = world.config;

  let neighbours = 0;
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      if (dx === 0 && dy === 0) continue;
      const nx = (x + dx + width) % width;
      const ny = (y + dy + height) % height;
      if (world.grid[ny][nx] !== null) neighbours++;
    }
  }

  // Genome-driven survival: gene[neighbours] says whether this organism
  // "should" be alive at this neighbour count.
  const survives = organism.genome[neighbours] as boolean;
  // Canonical GoL survival zone: 2 or 3 neighbours
  const canonical = neighbours === 2 || neighbours === 3;

  return (survives ? 6 : 0) + (canonical ? 4 : 0) + organism.age * 0.1;
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
    length: 9, // gene[i] = survive with i live neighbours
    genes: Array(9).fill({ type: "boolean" }),
  },
  energyPerTick: 0,
  energyGainPerTick: 0,
  reproductionThreshold: 3,
  seed: 42,
});

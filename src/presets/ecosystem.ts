import { createConfig } from "../core/World";
import { compositeFitness, survivalFitness, longevityFitness } from "../core/Fitness";
import type { FitnessFunction, SimConfig } from "../core/types";

/**
 * Predator-prey ecosystem: herbivores, predators, and plants compete
 * for energy in a bounded grid.
 */
export const ecosystemFitness: FitnessFunction = compositeFitness(
  [survivalFitness, longevityFitness],
  [0.6, 0.4]
);

export const ecosystemConfig: SimConfig = createConfig({
  width: 60,
  height: 60,
  populationSize: 100,
  carryingCapacity: 300,
  mutationRate: 0.02,
  crossoverRate: 0.75,
  crossoverType: "two-point",
  selectionType: "tournament",
  elitismCount: 5,
  tournamentSize: 4,
  genomeSchema: {
    length: 12,
    genes: [
      { type: "number", min: 0, max: 1 },  // speed
      { type: "number", min: 0, max: 1 },  // strength
      { type: "number", min: 0, max: 1 },  // vision range
      { type: "number", min: 0, max: 1 },  // energy efficiency
      { type: "boolean" },                  // herbivore (true) / predator (false)
      { type: "number", min: 0, max: 1 },  // reproduction drive
      { type: "number", min: 0, max: 1 },  // aggression
      { type: "number", min: 0, max: 1 },  // camouflage
      { type: "number", min: 0, max: 1 },  // resilience
      { type: "number", min: 0, max: 1 },  // foraging skill
      { type: "number", min: 0, max: 1 },  // social tendency
      { type: "number", min: 0, max: 1 },  // territory size
    ],
  },
  energyPerTick: 2,
  energyGainPerTick: 4,
  reproductionThreshold: 150,
  seed: 7,
});

import { survivalFitness } from "../core/Fitness";
import { defaultConfig } from "../core/World";
import type { FitnessFunction, MoveFn, SimConfig, WorldState } from "../core/types";
import { ecosystemConfig, ecosystemFitness } from "./ecosystem";
import { gameOfLifeConfig, gameOfLifeFitness, gameOfLifeTick } from "./gameOfLife";
import { pathfinderConfig, pathfinderFitness, pathfinderMoveFn } from "./pathfinder";

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: SimConfig;
  fitnessFn: FitnessFunction;
  moveFn?: MoveFn;
  /** Replaces the entire tick loop (e.g. cellular automata that don't use GA mechanics) */
  tickFn?: (world: WorldState) => WorldState;
}

export const PRESETS: Preset[] = [
  {
    id: "default",
    name: "Default",
    description: "Organisms evolve to maximise energy",
    config: defaultConfig,
    fitnessFn: survivalFitness,
  },
  {
    id: "game-of-life",
    name: "Game of Life",
    description: "Real Conway's GoL — cells survive with 2–3 neighbours, born with exactly 3",
    config: gameOfLifeConfig,
    fitnessFn: gameOfLifeFitness,
    tickFn: gameOfLifeTick,
  },
  {
    id: "pathfinder",
    name: "Pathfinder",
    description: "Genome-driven movement; organisms evolve toward the goal",
    config: pathfinderConfig,
    fitnessFn: pathfinderFitness,
    moveFn: pathfinderMoveFn,
  },
  {
    id: "ecosystem",
    name: "Ecosystem",
    description: "Predator-prey dynamics with composite fitness",
    config: ecosystemConfig,
    fitnessFn: ecosystemFitness,
  },
];

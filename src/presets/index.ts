import { survivalFitness } from "../core/Fitness";
import { defaultConfig } from "../core/World";
import type { FitnessFunction, MoveFn, SimConfig } from "../core/types";
import { ecosystemConfig, ecosystemFitness } from "./ecosystem";
import { gameOfLifeConfig, gameOfLifeFitness } from "./gameOfLife";
import { pathfinderConfig, pathfinderFitness, pathfinderMoveFn } from "./pathfinder";

export interface Preset {
  id: string;
  name: string;
  description: string;
  config: SimConfig;
  fitnessFn: FitnessFunction;
  moveFn?: MoveFn;
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
    description: "Genome encodes survival rules; clusters emerge via selection",
    config: gameOfLifeConfig,
    fitnessFn: gameOfLifeFitness,
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

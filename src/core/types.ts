// ─── Gene & Genome ────────────────────────────────────────────────────────────

export type Gene = number | boolean | string;
export type Genome = Gene[];

export interface GeneSchema {
  type: "number" | "boolean" | "string";
  min?: number;   // for number genes
  max?: number;   // for number genes
  options?: string[]; // for string genes
}

export interface GenomeSchema {
  length: number;
  genes: GeneSchema[];
}

// ─── Organism ─────────────────────────────────────────────────────────────────

export interface Organism {
  id: string;
  genome: Genome;
  position: [number, number];
  energy: number;
  age: number;
  traits: Record<string, number>; // decoded from genome
  alive: boolean;
}

// ─── World ────────────────────────────────────────────────────────────────────

export type Cell = string | null; // organism id or empty

export interface WorldState {
  grid: Cell[][];
  organisms: Organism[];
  generation: number;
  tick: number;
  config: SimConfig;
  rngState: number; // mulberry32 state
}

// ─── Config ───────────────────────────────────────────────────────────────────

export interface SimConfig {
  width: number;
  height: number;
  populationSize: number;
  carryingCapacity: number;
  mutationRate: number;         // [0, 1]
  crossoverRate: number;        // [0, 1]
  crossoverType: CrossoverType;
  selectionType: SelectionType;
  elitismCount: number;
  tournamentSize: number;
  genomeSchema: GenomeSchema;
  energyPerTick: number;
  reproductionThreshold: number;
  seed: number;
}

export type CrossoverType = "single-point" | "two-point" | "uniform";
export type SelectionType = "tournament" | "roulette" | "rank" | "elitism";

// ─── Fitness ──────────────────────────────────────────────────────────────────

export type FitnessFunction = (organism: Organism, world: WorldState) => number;

// ─── Operators ────────────────────────────────────────────────────────────────

export interface SelectionResult {
  selected: Organism[];
}

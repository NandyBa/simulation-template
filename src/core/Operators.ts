import { cloneGenome, clampGene } from "./Genome";
import { createRNG, randInt } from "./RNG";
import type {
  Genome,
  GenomeSchema,
  Organism,
  CrossoverType,
  SelectionType,
} from "./types";

// ─── Crossover ────────────────────────────────────────────────────────────────

/** Returns two child genomes from two parents using the specified crossover type */
export function crossover(
  parentA: Genome,
  parentB: Genome,
  type: CrossoverType,
  seed: number
): [Genome, Genome] {
  const rng = createRNG(seed);
  switch (type) {
    case "single-point":
      return singlePointCrossover(parentA, parentB, rng);
    case "two-point":
      return twoPointCrossover(parentA, parentB, rng);
    case "uniform":
      return uniformCrossover(parentA, parentB, rng);
  }
}

function singlePointCrossover(
  a: Genome,
  b: Genome,
  rng: () => number
): [Genome, Genome] {
  const point = randInt(rng, 1, a.length - 1);
  return [
    [...a.slice(0, point), ...b.slice(point)],
    [...b.slice(0, point), ...a.slice(point)],
  ];
}

function twoPointCrossover(
  a: Genome,
  b: Genome,
  rng: () => number
): [Genome, Genome] {
  let p1 = randInt(rng, 1, a.length - 2);
  let p2 = randInt(rng, p1 + 1, a.length - 1);
  return [
    [...a.slice(0, p1), ...b.slice(p1, p2), ...a.slice(p2)],
    [...b.slice(0, p1), ...a.slice(p1, p2), ...b.slice(p2)],
  ];
}

function uniformCrossover(
  a: Genome,
  b: Genome,
  rng: () => number
): [Genome, Genome] {
  const child1 = a.map((gene, i) => (rng() < 0.5 ? gene : b[i]));
  const child2 = b.map((gene, i) => (rng() < 0.5 ? gene : a[i]));
  return [child1, child2];
}

// ─── Mutation ─────────────────────────────────────────────────────────────────

export type MutationType = "bit-flip" | "gaussian" | "swap" | "scramble";

/** Returns a mutated copy of the genome — never mutates in place */
export function mutate(
  genome: Genome,
  schema: GenomeSchema,
  type: MutationType,
  rate: number,
  seed: number
): Genome {
  const rng = createRNG(seed);
  switch (type) {
    case "bit-flip":
      return bitFlipMutation(genome, schema, rate, rng);
    case "gaussian":
      return gaussianMutation(genome, schema, rate, rng);
    case "swap":
      return swapMutation(genome, rate, rng);
    case "scramble":
      return scrambleMutation(genome, rate, rng);
  }
}

function bitFlipMutation(
  genome: Genome,
  schema: GenomeSchema,
  rate: number,
  rng: () => number
): Genome {
  return genome.map((gene, i) => {
    if (rng() >= rate) return gene;
    const gs = schema.genes[i];
    if (gs.type === "boolean") return !(gene as boolean);
    if (gs.type === "number") {
      const min = gs.min ?? 0;
      const max = gs.max ?? 1;
      return min + rng() * (max - min);
    }
    // string: pick random option
    const opts = gs.options ?? [];
    return opts[Math.floor(rng() * opts.length)] ?? gene;
  });
}

function gaussianMutation(
  genome: Genome,
  schema: GenomeSchema,
  rate: number,
  rng: () => number
): Genome {
  return genome.map((gene, i) => {
    if (rng() >= rate) return gene;
    const gs = schema.genes[i];
    if (gs.type !== "number") return gene;
    // Box-Muller gaussian noise
    const u1 = rng() || 1e-10;
    const u2 = rng();
    const noise = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const range = (gs.max ?? 1) - (gs.min ?? 0);
    return clampGene((gene as number) + noise * range * 0.1, gs);
  });
}

function swapMutation(genome: Genome, rate: number, rng: () => number): Genome {
  const out = cloneGenome(genome);
  if (rng() < rate) {
    const i = randInt(rng, 0, out.length - 1);
    const j = randInt(rng, 0, out.length - 1);
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function scrambleMutation(genome: Genome, rate: number, rng: () => number): Genome {
  const out = cloneGenome(genome);
  if (rng() < rate) {
    const start = randInt(rng, 0, out.length - 2);
    const end = randInt(rng, start + 1, out.length - 1);
    const sub = out.slice(start, end + 1);
    for (let i = sub.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      [sub[i], sub[j]] = [sub[j], sub[i]];
    }
    out.splice(start, sub.length, ...sub);
  }
  return out;
}

// ─── Selection ────────────────────────────────────────────────────────────────

/** Select organisms for reproduction */
export function select(
  organisms: Organism[],
  fitnesses: number[],
  type: SelectionType,
  count: number,
  tournamentSize: number,
  seed: number
): Organism[] {
  const rng = createRNG(seed);
  switch (type) {
    case "tournament":
      return tournamentSelection(organisms, fitnesses, count, tournamentSize, rng);
    case "roulette":
      return rouletteSelection(organisms, fitnesses, count, rng);
    case "rank":
      return rankSelection(organisms, fitnesses, count, rng);
    case "elitism":
      return elitismSelection(organisms, fitnesses, count);
  }
}

function tournamentSelection(
  organisms: Organism[],
  fitnesses: number[],
  count: number,
  k: number,
  rng: () => number
): Organism[] {
  const result: Organism[] = [];
  for (let i = 0; i < count; i++) {
    let best = -1;
    let bestFit = -Infinity;
    for (let j = 0; j < k; j++) {
      const idx = Math.floor(rng() * organisms.length);
      if (fitnesses[idx] > bestFit) {
        bestFit = fitnesses[idx];
        best = idx;
      }
    }
    result.push(organisms[best]);
  }
  return result;
}

function rouletteSelection(
  organisms: Organism[],
  fitnesses: number[],
  count: number,
  rng: () => number
): Organism[] {
  const total = fitnesses.reduce((a, b) => a + b, 0);
  const result: Organism[] = [];
  for (let i = 0; i < count; i++) {
    let r = rng() * total;
    for (let j = 0; j < organisms.length; j++) {
      r -= fitnesses[j];
      if (r <= 0) {
        result.push(organisms[j]);
        break;
      }
    }
  }
  return result;
}

function rankSelection(
  organisms: Organism[],
  fitnesses: number[],
  count: number,
  rng: () => number
): Organism[] {
  const ranked = organisms
    .map((o, i) => ({ o, f: fitnesses[i] }))
    .sort((a, b) => a.f - b.f);
  const ranks = ranked.map((_, i) => i + 1);
  return rouletteSelection(ranked.map((r) => r.o), ranks, count, rng);
}

function elitismSelection(
  organisms: Organism[],
  fitnesses: number[],
  count: number
): Organism[] {
  return organisms
    .map((o, i) => ({ o, f: fitnesses[i] }))
    .sort((a, b) => b.f - a.f)
    .slice(0, count)
    .map((r) => r.o);
}

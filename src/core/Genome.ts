import { createRNG } from "./RNG";
import type { Gene, Genome, GenomeSchema, GeneSchema } from "./types";

/** Creates a random genome following the given schema */
export function createGenome(schema: GenomeSchema, seed: number): Genome {
  const rng = createRNG(seed);
  return schema.genes.map((g) => randomGene(g, rng));
}

function randomGene(schema: GeneSchema, rng: () => number): Gene {
  switch (schema.type) {
    case "boolean":
      return rng() < 0.5;
    case "string":
      if (!schema.options?.length) throw new Error("String gene requires options");
      return schema.options[Math.floor(rng() * schema.options.length)];
    case "number": {
      const min = schema.min ?? 0;
      const max = schema.max ?? 1;
      return min + rng() * (max - min);
    }
  }
}

/** Deep clone a genome — no shared references */
export function cloneGenome(genome: Genome): Genome {
  return [...genome];
}

/**
 * Decodes a genome into named traits.
 * Number genes map to their value, boolean genes map to 0/1, strings to hash.
 */
export function decodeTraits(genome: Genome, schema: GenomeSchema): Record<string, number> {
  const traits: Record<string, number> = {};
  genome.forEach((gene, i) => {
    const name = `gene_${i}`;
    if (typeof gene === "number") {
      traits[name] = gene;
    } else if (typeof gene === "boolean") {
      traits[name] = gene ? 1 : 0;
    } else {
      // string gene: use index in options list as numeric value
      const idx = schema.genes[i].options?.indexOf(gene) ?? 0;
      traits[name] = idx;
    }
  });
  return traits;
}

/** Clamp a number gene value to its schema bounds */
export function clampGene(value: number, schema: GeneSchema): number {
  const min = schema.min ?? 0;
  const max = schema.max ?? 1;
  return Math.min(max, Math.max(min, value));
}

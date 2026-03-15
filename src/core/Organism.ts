import { createGenome, decodeTraits } from "./Genome";
import type { Genome, GenomeSchema, Organism } from "./types";

let _idCounter = 0;

/** Creates a new organism with a fresh genome */
export function createOrganism(
  schema: GenomeSchema,
  position: [number, number],
  seed: number
): Organism {
  const genome = createGenome(schema, seed);
  return {
    id: `org_${++_idCounter}`,
    genome,
    position,
    energy: 100,
    age: 0,
    traits: decodeTraits(genome, schema),
    alive: true,
  };
}

/** Creates an organism from an existing genome */
export function createOrganismFromGenome(
  genome: Genome,
  schema: GenomeSchema,
  position: [number, number]
): Organism {
  return {
    id: `org_${++_idCounter}`,
    genome,
    position,
    energy: 100,
    age: 0,
    traits: decodeTraits(genome, schema),
    alive: true,
  };
}

/** Returns a copy of the organism with updated fields */
export function updateOrganism(
  organism: Organism,
  updates: Partial<Organism>
): Organism {
  return { ...organism, ...updates };
}

/** Reset the ID counter (for deterministic tests) */
export function resetOrganismIdCounter(): void {
  _idCounter = 0;
}

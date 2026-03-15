import { crossover, mutate, select } from "../../core/Operators";
import type { Genome, Organism } from "../../core/types";

const schema = {
  length: 8,
  genes: Array(8).fill({ type: "number" as const, min: 0, max: 1 }),
};

const makeGenome = (seed: number): Genome =>
  Array.from({ length: 8 }, (_, i) => (seed + i) / 10);

function makeOrganism(id: string, energy: number): Organism {
  return {
    id,
    genome: makeGenome(Number(id.replace(/\D/g, "")) || 1),
    position: [0, 0],
    energy,
    age: 0,
    traits: {},
    alive: true,
  };
}

describe("Crossover", () => {
  it("single-point preserves total gene count", () => {
    const [c1, c2] = crossover(makeGenome(1), makeGenome(2), "single-point", 42);
    expect(c1).toHaveLength(8);
    expect(c2).toHaveLength(8);
  });

  it("offspring differ from both parents", () => {
    const a = makeGenome(1);
    const b = makeGenome(5);
    const [c1] = crossover(a, b, "uniform", 7);
    expect(c1).not.toEqual(a);
    expect(c1).not.toEqual(b);
  });

  it("crossover offspring are independent objects", () => {
    const [c1, c2] = crossover(makeGenome(1), makeGenome(2), "uniform", 1);
    (c1[0] as number);
    c1[0] = 999;
    expect(c2[0]).not.toBe(999);
  });
});

describe("Mutation", () => {
  it("zero mutation rate returns identical genome", () => {
    const g = makeGenome(3);
    const mutated = mutate(g, schema, "bit-flip", 0, 42);
    expect(mutated).toEqual(g);
  });

  it("gaussian mutation stays within gene bounds", () => {
    const g = makeGenome(3);
    for (let i = 0; i < 50; i++) {
      const mutated = mutate(g, schema, "gaussian", 1, i);
      for (const gene of mutated) {
        expect(gene as number).toBeGreaterThanOrEqual(0);
        expect(gene as number).toBeLessThanOrEqual(1);
      }
    }
  });
});

describe("Selection", () => {
  const orgs = [
    makeOrganism("1", 10),
    makeOrganism("2", 50),
    makeOrganism("3", 90),
    makeOrganism("4", 30),
  ];
  const fits = [10, 50, 90, 30];

  it("elitism preserves top N organisms", () => {
    const selected = select(orgs, fits, "elitism", 2, 3, 1);
    expect(selected[0].id).toBe("3");
    expect(selected[1].id).toBe("2");
  });

  it("roulette never selects zero-fitness organism", () => {
    const zeroFits = [0, 0, 100, 0];
    for (let i = 0; i < 20; i++) {
      const [s] = select(orgs, zeroFits, "roulette", 1, 3, i);
      expect(s.id).toBe("3");
    }
  });
});

import { createGenome, cloneGenome, decodeTraits, clampGene } from "../../core/Genome";
import type { GenomeSchema } from "../../core/types";

const schema: GenomeSchema = {
  length: 4,
  genes: [
    { type: "number", min: 0, max: 1 },
    { type: "boolean" },
    { type: "string", options: ["A", "B", "C"] },
    { type: "number", min: -1, max: 1 },
  ],
};

describe("Genome", () => {
  it("creates genome of correct length from schema", () => {
    const g = createGenome(schema, 42);
    expect(g).toHaveLength(schema.length);
  });

  it("clones without reference sharing", () => {
    const g = createGenome(schema, 1);
    const c = cloneGenome(g);
    expect(c).toEqual(g);
    expect(c).not.toBe(g);
  });

  it("decodes traits deterministically", () => {
    const g = createGenome(schema, 99);
    const t1 = decodeTraits(g, schema);
    const t2 = decodeTraits(g, schema);
    expect(t1).toEqual(t2);
  });

  it("clampGene keeps value in bounds", () => {
    expect(clampGene(1.5, { type: "number", min: 0, max: 1 })).toBe(1);
    expect(clampGene(-0.5, { type: "number", min: 0, max: 1 })).toBe(0);
    expect(clampGene(0.5, { type: "number", min: 0, max: 1 })).toBe(0.5);
  });
});

import { survivalFitness, longevityFitness, compositeFitness, safeFitness } from "../../core/Fitness";
import { defaultConfig } from "../../core/World";
import type { Organism, WorldState } from "../../core/types";

function makeOrg(overrides: Partial<Organism> = {}): Organism {
  return {
    id: "test",
    genome: [],
    position: [0, 0],
    energy: 100,
    age: 5,
    traits: {},
    alive: true,
    ...overrides,
  };
}

const mockWorld = { config: defaultConfig } as WorldState;

describe("survivalFitness", () => {
  it("returns positive score for alive organism", () => {
    expect(survivalFitness(makeOrg(), mockWorld)).toBeGreaterThan(0);
  });

  it("returns 0 for dead organism", () => {
    expect(survivalFitness(makeOrg({ alive: false }), mockWorld)).toBe(0);
  });
});

describe("safeFitness", () => {
  it("returns 0 instead of NaN", () => {
    const nanFn = () => NaN;
    expect(safeFitness(nanFn)(makeOrg(), mockWorld)).toBe(0);
  });

  it("returns 0 instead of Infinity", () => {
    const infFn = () => Infinity;
    expect(safeFitness(infFn)(makeOrg(), mockWorld)).toBe(0);
  });
});

describe("compositeFitness", () => {
  it("weights contributions correctly", () => {
    const composite = compositeFitness([survivalFitness, longevityFitness], [1, 0]);
    const energyOnly = survivalFitness(makeOrg(), mockWorld);
    expect(composite(makeOrg(), mockWorld)).toBe(energyOnly);
  });
});

import { createWorld, tick, createConfig, defaultConfig } from "../../core/World";
import { crossover } from "../../core/Operators";

function deepFreeze<T>(obj: T): T {
  Object.freeze(obj);
  if (typeof obj === "object" && obj !== null) {
    for (const v of Object.values(obj)) deepFreeze(v);
  }
  return obj;
}

describe("Anti-hallucination guards", () => {
  it("tick() does not mutate input world state", () => {
    const world = createWorld(defaultConfig);
    const frozen = deepFreeze(structuredClone(world));
    const next = tick(world);
    expect(world).toEqual(frozen);
    expect(next).not.toBe(world);
  });

  it("crossover offspring genomes are independent objects", () => {
    const a = [1, 2, 3, 4];
    const b = [5, 6, 7, 8];
    const [c1, c2] = crossover(a, b, "uniform", 42);
    c1[0] = 999;
    expect(c2[0]).not.toBe(999);
  });

  it("mutation rate clamped — throws above 1", () => {
    expect(() => createConfig({ mutationRate: 1.5 })).toThrow();
  });

  it("mutation rate clamped — throws below 0", () => {
    expect(() => createConfig({ mutationRate: -0.1 })).toThrow();
  });

  it("total population never exceeds carrying capacity", () => {
    const config = createConfig({ populationSize: 10, carryingCapacity: 20, seed: 7 });
    let world = createWorld(config);
    for (let i = 0; i < 20; i++) {
      world = tick(world);
      expect(world.organisms.length).toBeLessThanOrEqual(world.config.carryingCapacity);
    }
  });
});

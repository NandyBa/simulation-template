import { createWorld, tick, createConfig, defaultConfig } from "../../core/World";

describe("createConfig", () => {
  it("throws if mutationRate > 1", () => {
    expect(() => createConfig({ mutationRate: 1.5 })).toThrow();
  });

  it("throws if mutationRate < 0", () => {
    expect(() => createConfig({ mutationRate: -0.1 })).toThrow();
  });
});

describe("World tick", () => {
  it("tick() does not mutate input world state", () => {
    const world = createWorld(defaultConfig);
    const snapshot = JSON.parse(JSON.stringify(world));
    tick(world);
    expect(world.tick).toBe(snapshot.tick);
    expect(world.generation).toBe(snapshot.generation);
  });

  it("tick increases tick counter", () => {
    const w0 = createWorld(defaultConfig);
    const w1 = tick(w0);
    expect(w1.tick).toBe(1);
  });

  it("empty world stays empty after tick", () => {
    const config = createConfig({ populationSize: 0, carryingCapacity: 10 });
    const world = createWorld(config);
    const next = tick(world);
    expect(next.organisms.filter((o) => o.alive)).toHaveLength(0);
  });
});

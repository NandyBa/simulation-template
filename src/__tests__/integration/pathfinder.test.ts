import { createWorld, tick } from "../../core/World";
import { pathfinderConfig, pathfinderFitness, pathfinderMoveFn } from "../../presets/pathfinder";
import type { Organism } from "../../core/types";

function makeOrg(overrides: Partial<Organism>): Organism {
  return {
    id: "test",
    genome: Array(20).fill("E"), // always move East
    position: [0, 0],
    energy: 100,
    age: 0,
    traits: {},
    alive: true,
    ...overrides,
  };
}

describe("Pathfinder preset integration", () => {
  it("world initialises without error", () => {
    expect(() => createWorld(pathfinderConfig)).not.toThrow();
  });

  it("runs 20 ticks without error", () => {
    let world = createWorld(pathfinderConfig);
    expect(() => {
      for (let i = 0; i < 20; i++) world = tick(world, pathfinderFitness, pathfinderMoveFn);
    }).not.toThrow();
  });

  it("population stays within carrying capacity", () => {
    let world = createWorld(pathfinderConfig);
    for (let i = 0; i < 20; i++) world = tick(world, pathfinderFitness, pathfinderMoveFn);
    expect(world.organisms.filter(o => o.alive).length).toBeLessThanOrEqual(pathfinderConfig.carryingCapacity);
  });
});

describe("pathfinderMoveFn", () => {
  it("returns 4 direction candidates", () => {
    const org = makeOrg({});
    const dirs = pathfinderMoveFn(org, 0);
    expect(dirs).toHaveLength(4);
  });

  it("puts genome-preferred direction first — East at tick 0", () => {
    const org = makeOrg({ genome: Array(20).fill("E") });
    const [first] = pathfinderMoveFn(org, 0);
    expect(first).toEqual([1, 0]); // E = [1, 0]
  });

  it("puts North first when genome encodes N", () => {
    const org = makeOrg({ genome: Array(20).fill("N") });
    const [first] = pathfinderMoveFn(org, 0);
    expect(first).toEqual([0, -1]); // N = [0, -1]
  });

  it("cycles through genome on successive ticks", () => {
    const genome = ["N", "S", "E", "W", ...Array(16).fill("N")];
    const org = makeOrg({ genome });
    expect(pathfinderMoveFn(org, 0)[0]).toEqual([0, -1]); // N
    expect(pathfinderMoveFn(org, 1)[0]).toEqual([0, 1]);  // S
    expect(pathfinderMoveFn(org, 2)[0]).toEqual([1, 0]);  // E
    expect(pathfinderMoveFn(org, 3)[0]).toEqual([-1, 0]); // W
  });
});

describe("pathfinderFitness", () => {
  it("returns 0 for dead organism", () => {
    const world = createWorld(pathfinderConfig);
    const dead = makeOrg({ alive: false });
    expect(pathfinderFitness(dead, world)).toBe(0);
  });

  it("returns max score at goal position", () => {
    const world = createWorld(pathfinderConfig);
    const goalX = pathfinderConfig.width - 1;
    const goalY = pathfinderConfig.height - 1;
    const org = makeOrg({ position: [goalX, goalY] });
    const score = pathfinderFitness(org, world);
    const maxDist = pathfinderConfig.width + pathfinderConfig.height - 2;
    expect(score).toBeGreaterThanOrEqual(maxDist);
  });

  it("returns lower score further from goal", () => {
    const world = createWorld(pathfinderConfig);
    const goalX = pathfinderConfig.width - 1;
    const goalY = pathfinderConfig.height - 1;
    const near = makeOrg({ id: "near", position: [goalX - 1, goalY] });
    const far  = makeOrg({ id: "far",  position: [0, 0] });
    expect(pathfinderFitness(near, world)).toBeGreaterThan(pathfinderFitness(far, world));
  });
});

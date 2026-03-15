import { createWorld, tick } from "../../core/World";
import { gameOfLifeConfig, gameOfLifeFitness } from "../../presets/gameOfLife";
import type { Organism, WorldState } from "../../core/types";

function makeOrg(overrides: Partial<Organism>): Organism {
  return {
    id: "test",
    genome: Array(9).fill(false),
    position: [5, 5],
    energy: 100,
    age: 0,
    traits: {},
    alive: true,
    ...overrides,
  };
}

function makeWorld(orgs: Organism[]): WorldState {
  const grid = Array.from({ length: gameOfLifeConfig.height }, () =>
    Array(gameOfLifeConfig.width).fill(null)
  );
  for (const o of orgs) {
    const [x, y] = o.position;
    grid[y][x] = o.id;
  }
  return {
    grid,
    organisms: orgs,
    generation: 0,
    tick: 0,
    config: gameOfLifeConfig,
    rngState: 42,
  };
}

describe("Game of Life preset integration", () => {
  it("world initialises without error", () => {
    expect(() => createWorld(gameOfLifeConfig)).not.toThrow();
  });

  it("empty world stays empty after tick", () => {
    const config = { ...gameOfLifeConfig, populationSize: 0 };
    const world = createWorld(config);
    const next = tick(world);
    expect(next.organisms.filter((o) => o.alive)).toHaveLength(0);
  });

  it("runs 20 ticks without error", () => {
    let world = createWorld(gameOfLifeConfig);
    expect(() => {
      for (let i = 0; i < 20; i++) world = tick(world, gameOfLifeFitness);
    }).not.toThrow();
  });

  it("population stays within carrying capacity", () => {
    let world = createWorld(gameOfLifeConfig);
    for (let i = 0; i < 20; i++) world = tick(world, gameOfLifeFitness);
    expect(world.organisms.filter(o => o.alive).length).toBeLessThanOrEqual(gameOfLifeConfig.carryingCapacity);
  });
});

describe("gameOfLifeFitness", () => {
  it("returns 0 for dead organism", () => {
    const org = makeOrg({ alive: false });
    const world = makeWorld([org]);
    expect(gameOfLifeFitness(org, world)).toBe(0);
  });

  it("gives bonus when genome says survive and has 2 neighbours", () => {
    // gene[2] = true → survive with 2 neighbours
    const genome = Array(9).fill(false);
    genome[2] = true;
    const org = makeOrg({ genome });

    // Place 2 neighbours adjacent to org at [5,5]
    const n1 = makeOrg({ id: "n1", position: [5, 4] });
    const n2 = makeOrg({ id: "n2", position: [5, 6] });
    const world = makeWorld([org, n1, n2]);

    const score = gameOfLifeFitness(org, world);
    // survives(true)=6 + canonical(2 neighbours)=4 + age bonus
    expect(score).toBeGreaterThanOrEqual(10);
  });

  it("returns lower score for isolated organism (0 neighbours)", () => {
    const genome = Array(9).fill(false); // no survival genes
    const org = makeOrg({ genome });
    const world = makeWorld([org]); // isolated

    const scoreIsolated = gameOfLifeFitness(org, world);
    // 0 neighbours: survives=false(0), canonical=false(0), age=0 → score = 0
    expect(scoreIsolated).toBe(0);
  });

  it("canonical bonus applies regardless of genome", () => {
    const genome = Array(9).fill(false); // genome says never survive
    const org = makeOrg({ genome });

    const n1 = makeOrg({ id: "n1", position: [5, 4] });
    const n2 = makeOrg({ id: "n2", position: [5, 6] });
    const n3 = makeOrg({ id: "n3", position: [4, 5] });
    const world = makeWorld([org, n1, n2, n3]);

    const score = gameOfLifeFitness(org, world);
    // 3 neighbours: survives=false(0), canonical=true(4) + age=0
    expect(score).toBe(4);
  });
});

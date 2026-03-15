import { createWorld } from "../../core/World";
import { gameOfLifeConfig, gameOfLifeFitness, gameOfLifeTick } from "../../presets/gameOfLife";
import type { Organism, WorldState } from "../../core/types";

function makeOrg(overrides: Partial<Organism>): Organism {
  return {
    id: overrides.id ?? "test",
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
    const world = makeWorld([]);
    const next = gameOfLifeTick(world);
    expect(next.organisms.filter((o) => o.alive)).toHaveLength(0);
  });

  it("runs 20 ticks without error", () => {
    let world = createWorld(gameOfLifeConfig);
    expect(() => {
      for (let i = 0; i < 20; i++) world = gameOfLifeTick(world);
    }).not.toThrow();
  });

  it("population stays within carrying capacity", () => {
    let world = createWorld(gameOfLifeConfig);
    for (let i = 0; i < 20; i++) world = gameOfLifeTick(world);
    expect(world.organisms.filter(o => o.alive).length)
      .toBeLessThanOrEqual(gameOfLifeConfig.carryingCapacity);
  });

  it("tick counter increments", () => {
    const world = makeWorld([makeOrg({ position: [5, 5] })]);
    expect(gameOfLifeTick(world).tick).toBe(1);
  });
});

describe("gameOfLifeTick — Conway's rules", () => {
  it("isolated cell dies (0 neighbours)", () => {
    const world = makeWorld([makeOrg({ id: "a", position: [5, 5] })]);
    const next = gameOfLifeTick(world);
    const a = next.organisms.find((o) => o.id === "a");
    expect(a?.alive).toBe(false);
  });

  it("cell with 1 neighbour dies", () => {
    const world = makeWorld([
      makeOrg({ id: "a", position: [5, 5] }),
      makeOrg({ id: "b", position: [5, 6] }),
    ]);
    const next = gameOfLifeTick(world);
    expect(next.organisms.find((o) => o.id === "a")?.alive).toBe(false);
    expect(next.organisms.find((o) => o.id === "b")?.alive).toBe(false);
  });

  it("cell with 2 neighbours survives", () => {
    // a at [5,5] has neighbours b and c
    const world = makeWorld([
      makeOrg({ id: "a", position: [5, 5] }),
      makeOrg({ id: "b", position: [5, 4] }),
      makeOrg({ id: "c", position: [5, 6] }),
    ]);
    const next = gameOfLifeTick(world);
    expect(next.organisms.find((o) => o.id === "a")?.alive).toBe(true);
  });

  it("cell with 3 neighbours survives", () => {
    const world = makeWorld([
      makeOrg({ id: "a", position: [5, 5] }),
      makeOrg({ id: "b", position: [4, 5] }),
      makeOrg({ id: "c", position: [6, 5] }),
      makeOrg({ id: "d", position: [5, 4] }),
    ]);
    const next = gameOfLifeTick(world);
    expect(next.organisms.find((o) => o.id === "a")?.alive).toBe(true);
  });

  it("cell with 4+ neighbours dies (overcrowding)", () => {
    // a at [5,5] has 4 neighbours
    const world = makeWorld([
      makeOrg({ id: "a", position: [5, 5] }),
      makeOrg({ id: "b", position: [4, 5] }),
      makeOrg({ id: "c", position: [6, 5] }),
      makeOrg({ id: "d", position: [5, 4] }),
      makeOrg({ id: "e", position: [5, 6] }),
    ]);
    const next = gameOfLifeTick(world);
    expect(next.organisms.find((o) => o.id === "a")?.alive).toBe(false);
  });

  it("dead cell with exactly 3 neighbours is born", () => {
    // [10,10] is empty, but [10,9], [9,10], [11,10] are alive → 3 neighbours
    const world = makeWorld([
      makeOrg({ id: "b1", position: [10, 9] }),
      makeOrg({ id: "b2", position: [9, 10] }),
      makeOrg({ id: "b3", position: [11, 10] }),
    ]);
    const next = gameOfLifeTick(world);
    const born = next.organisms.find(
      (o) => o.alive && o.position[0] === 10 && o.position[1] === 10
    );
    expect(born).toBeDefined();
  });

  it("dead cell with 2 neighbours is NOT born", () => {
    const world = makeWorld([
      makeOrg({ id: "x", position: [10, 9] }),
      makeOrg({ id: "y", position: [9, 10] }),
    ]);
    const next = gameOfLifeTick(world);
    const born = next.organisms.find(
      (o) => o.alive && o.position[0] === 10 && o.position[1] === 10
    );
    expect(born).toBeUndefined();
  });
});

describe("gameOfLifeFitness", () => {
  it("returns 0 for dead organism", () => {
    const world = makeWorld([]);
    expect(gameOfLifeFitness(makeOrg({ alive: false }), world)).toBe(0);
  });

  it("returns age for live organism", () => {
    const world = makeWorld([]);
    const org = makeOrg({ age: 7 });
    expect(gameOfLifeFitness(org, world)).toBe(7);
  });
});

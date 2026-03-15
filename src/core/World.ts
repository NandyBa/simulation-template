import { createOrganism } from "./Organism";
import { createRNG } from "./RNG";
import type { Cell, SimConfig, WorldState } from "./types";

/** Creates an initial world state from a config */
export function createWorld(config: SimConfig): WorldState {
  const rng = createRNG(config.seed);
  const grid: Cell[][] = Array.from({ length: config.height }, () =>
    Array(config.width).fill(null)
  );

  const organisms = Array.from({ length: config.populationSize }, (_, i) => {
    const x = Math.floor(rng() * config.width);
    const y = Math.floor(rng() * config.height);
    return createOrganism(config.genomeSchema, [x, y], Math.floor(rng() * 2 ** 32));
  });

  // Place organisms on grid
  for (const org of organisms) {
    const [x, y] = org.position;
    grid[y][x] = org.id;
  }

  return {
    grid,
    organisms,
    generation: 0,
    tick: 0,
    config,
    rngState: Math.floor(rng() * 2 ** 32),
  };
}

/**
 * Advances the world by one tick.
 * Pure function: returns new WorldState, never mutates input.
 *
 * Tick phases: Sense → Decide → Act → Evaluate → Reproduce → Cull
 */
export function tick(world: WorldState): WorldState {
  // TODO: implement full tick phases in Phase 1.5
  // For now: age all organisms, drain energy, mark dead
  const organisms = world.organisms.map((org) => ({
    ...org,
    age: org.age + 1,
    energy: org.energy - world.config.energyPerTick,
    alive: org.energy - world.config.energyPerTick > 0,
  }));

  const newGrid: Cell[][] = Array.from({ length: world.config.height }, () =>
    Array(world.config.width).fill(null)
  );
  for (const org of organisms) {
    if (org.alive) {
      const [x, y] = org.position;
      newGrid[y][x] = org.id;
    }
  }

  return {
    ...world,
    grid: newGrid,
    organisms,
    tick: world.tick + 1,
  };
}

/** Validates a SimConfig and throws if invariants are violated */
export function validateConfig(config: Partial<SimConfig>): void {
  if (config.mutationRate !== undefined) {
    if (config.mutationRate < 0 || config.mutationRate > 1) {
      throw new Error(`mutationRate must be in [0, 1], got ${config.mutationRate}`);
    }
  }
  if (config.crossoverRate !== undefined) {
    if (config.crossoverRate < 0 || config.crossoverRate > 1) {
      throw new Error(`crossoverRate must be in [0, 1], got ${config.crossoverRate}`);
    }
  }
  if (config.populationSize !== undefined && config.carryingCapacity !== undefined) {
    if (config.populationSize > config.carryingCapacity) {
      throw new Error("populationSize cannot exceed carryingCapacity");
    }
  }
}

/** Creates a validated config, throwing on invalid values */
export function createConfig(partial: Partial<SimConfig>): SimConfig {
  validateConfig(partial);
  return { ...defaultConfig, ...partial };
}

export const defaultConfig: SimConfig = {
  width: 50,
  height: 50,
  populationSize: 50,
  carryingCapacity: 200,
  mutationRate: 0.01,
  crossoverRate: 0.7,
  crossoverType: "single-point",
  selectionType: "tournament",
  elitismCount: 2,
  tournamentSize: 3,
  genomeSchema: {
    length: 8,
    genes: Array(8).fill({ type: "number", min: 0, max: 1 }),
  },
  energyPerTick: 1,
  reproductionThreshold: 150,
  seed: 42,
};

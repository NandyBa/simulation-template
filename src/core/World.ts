import { createOrganismFromGenome, createOrganism } from "./Organism";
import { crossover, mutate, select } from "./Operators";
import { survivalFitness } from "./Fitness";
import { createRNG, randInt } from "./RNG";
import type { Cell, FitnessFunction, Organism, SimConfig, WorldState } from "./types";

/** Creates an initial world state from a config */
export function createWorld(config: SimConfig): WorldState {
  const rng = createRNG(config.seed);
  const grid: Cell[][] = Array.from({ length: config.height }, () =>
    Array(config.width).fill(null)
  );

  const organisms = Array.from({ length: config.populationSize }, () => {
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
export function tick(
  world: WorldState,
  fitnessfn: FitnessFunction = survivalFitness
): WorldState {
  const rng = createRNG(world.rngState);
  const { config } = world;

  // ── Phase 1: Age + energy drain + passive regen ──────────────────────────
  let organisms: Organism[] = world.organisms.map((org) => {
    const energy = org.energy + config.energyGainPerTick - config.energyPerTick;
    return { ...org, age: org.age + 1, energy, alive: energy > 0 };
  });

  // ── Phase 2: Move (Act) — each organism steps toward a random neighbour ──
  // Build an occupancy set to avoid collisions
  const occupied = new Set<string>(
    organisms.filter((o) => o.alive).map((o) => `${o.position[0]},${o.position[1]}`)
  );

  organisms = organisms.map((org) => {
    if (!org.alive) return org;
    const [x, y] = org.position;
    const dirs: [number, number][] = [[0, 1], [0, -1], [1, 0], [-1, 0]];
    // Shuffle directions for fairness
    const shuffled = dirs.slice().sort(() => rng() - 0.5);
    for (const [dx, dy] of shuffled) {
      const nx = (x + dx + config.width) % config.width;
      const ny = (y + dy + config.height) % config.height;
      const key = `${nx},${ny}`;
      if (!occupied.has(key)) {
        occupied.delete(`${x},${y}`);
        occupied.add(key);
        return { ...org, position: [nx, ny] as [number, number] };
      }
    }
    return org;
  });

  // ── Phase 3: Evaluate fitness ─────────────────────────────────────────────
  // Wrap in try-catch: a bad generated fitness fn should not crash the tick
  const partialWorld = { ...world, organisms };
  const fitnesses = organisms.map((o) => {
    if (!o.alive) return 0;
    try {
      const score = fitnessfn(o, partialWorld);
      return Number.isFinite(score) ? Math.max(0, score) : 0;
    } catch {
      return survivalFitness(o, partialWorld);
    }
  });

  // ── Phase 4: Reproduce ────────────────────────────────────────────────────
  const alive = organisms.filter((o) => o.alive);
  const newborns: Organism[] = [];

  if (
    alive.length >= 2 &&
    alive.length < config.carryingCapacity
  ) {
    const eligible = alive.filter((o) => o.energy >= config.reproductionThreshold);
    if (eligible.length >= 2) {
      const parents = select(
        eligible,
        eligible.map((o) => fitnessfn(o, { ...world, organisms })),
        config.selectionType,
        2,
        config.tournamentSize,
        Math.floor(rng() * 2 ** 32)
      );
      const [p1, p2] = parents;
      const seed = Math.floor(rng() * 2 ** 32);

      if (rng() < config.crossoverRate) {
        const [g1, g2] = crossover(p1.genome, p2.genome, config.crossoverType, seed);
        const mg1 = mutate(g1, config.genomeSchema, "gaussian", config.mutationRate, seed);
        const mg2 = mutate(g2, config.genomeSchema, "gaussian", config.mutationRate, seed + 1);

        const birthX = randInt(rng, 0, config.width - 1);
        const birthY = randInt(rng, 0, config.height - 1);
        const birthKey = `${birthX},${birthY}`;

        if (!occupied.has(birthKey) && organisms.length + newborns.length < config.carryingCapacity) {
          newborns.push(createOrganismFromGenome(mg1, config.genomeSchema, [birthX, birthY]));
          occupied.add(birthKey);
        }

        const b2x = randInt(rng, 0, config.width - 1);
        const b2y = randInt(rng, 0, config.height - 1);
        const b2key = `${b2x},${b2y}`;
        if (!occupied.has(b2key) && organisms.length + newborns.length < config.carryingCapacity) {
          newborns.push(createOrganismFromGenome(mg2, config.genomeSchema, [b2x, b2y]));
        }
      }
    }
  }

  // ── Phase 5: Cull — enforce carrying capacity ─────────────────────────────
  let nextOrganisms = [...organisms, ...newborns];

  if (nextOrganisms.filter((o) => o.alive).length > config.carryingCapacity) {
    // Remove lowest-fitness alive organisms until within cap
    const sorted = nextOrganisms
      .map((o, i) => ({ o, f: o.alive ? (fitnesses[i] ?? 0) : Infinity }))
      .sort((a, b) => b.f - a.f);
    let aliveCount = 0;
    nextOrganisms = sorted.map(({ o }) => {
      if (!o.alive) return o;
      aliveCount++;
      return aliveCount <= config.carryingCapacity ? o : { ...o, alive: false };
    });
  }

  // Remove dead organisms that have been dead (keep list tidy)
  nextOrganisms = nextOrganisms.filter((o) => o.alive || o.age < 5);

  // ── Rebuild grid ──────────────────────────────────────────────────────────
  const newGrid: Cell[][] = Array.from({ length: config.height }, () =>
    Array(config.width).fill(null)
  );
  for (const org of nextOrganisms) {
    if (org.alive) {
      const [x, y] = org.position;
      newGrid[y][x] = org.id;
    }
  }

  // Check if a full generation has elapsed (all original organisms replaced)
  const aliveIds = new Set(world.organisms.map((o) => o.id));
  const anyOriginalAlive = nextOrganisms.some((o) => o.alive && aliveIds.has(o.id));
  const generation = anyOriginalAlive ? world.generation : world.generation + 1;

  return {
    ...world,
    grid: newGrid,
    organisms: nextOrganisms,
    generation,
    tick: world.tick + 1,
    rngState: Math.floor(rng() * 2 ** 32),
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
  energyPerTick: 2,
  energyGainPerTick: 3,         // net +1 energy/tick; builds toward reproductionThreshold
  reproductionThreshold: 120,   // reachable from starting energy of 100 after ~20 ticks
  seed: 42,
};

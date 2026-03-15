import { createOrganism } from "../core/Organism";
import { createRNG } from "../core/RNG";
import { createConfig } from "../core/World";
import type { Cell, FitnessFunction, SimConfig, WorldState } from "../core/types";

/**
 * Real Conway's Game of Life tick.
 *
 * Rules (same as the 1970 original):
 *   - Live cell with 2 or 3 live neighbours → survives
 *   - Live cell with < 2 neighbours        → dies (loneliness)
 *   - Live cell with > 3 neighbours        → dies (overcrowding)
 *   - Dead cell with exactly 3 neighbours  → born (new organism)
 *
 * No movement. No crossover. No fitness function. Pure determinism.
 */
export function gameOfLifeTick(world: WorldState): WorldState {
  const { config } = world;
  const { width, height } = config;
  const rng = createRNG(world.rngState);

  // Count live neighbours for every cell that could be affected
  // (only cells adjacent to at least one live cell matter)
  const neighbourCount = new Map<string, number>();
  for (const org of world.organisms) {
    if (!org.alive) continue;
    const [x, y] = org.position;
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        if (dx === 0 && dy === 0) continue;
        const nx = (x + dx + width) % width;
        const ny = (y + dy + height) % height;
        const key = `${nx},${ny}`;
        neighbourCount.set(key, (neighbourCount.get(key) ?? 0) + 1);
      }
    }
  }

  const alivePos = new Set(
    world.organisms.filter((o) => o.alive).map((o) => `${o.position[0]},${o.position[1]}`)
  );

  // Survive or die — existing organisms
  const survived = world.organisms
    .filter((o) => o.alive)
    .map((o) => {
      const n = neighbourCount.get(`${o.position[0]},${o.position[1]}`) ?? 0;
      return { ...o, age: o.age + 1, alive: n === 2 || n === 3 };
    });

  // Birth — empty cells with exactly 3 live neighbours
  const newborns = [];
  for (const [key, count] of neighbourCount) {
    if (count !== 3 || alivePos.has(key)) continue;
    if (survived.filter((o) => o.alive).length + newborns.length >= config.carryingCapacity) break;
    const [bx, by] = key.split(",").map(Number) as [number, number];
    newborns.push(createOrganism(config.genomeSchema, [bx, by], Math.floor(rng() * 2 ** 32)));
  }

  const all = [...survived, ...newborns].filter((o) => o.alive || o.age < 5);

  // Rebuild grid
  const newGrid: Cell[][] = Array.from({ length: height }, () =>
    Array(width).fill(null)
  );
  for (const org of all) {
    if (org.alive) newGrid[org.position[1]][org.position[0]] = org.id;
  }

  return {
    ...world,
    grid: newGrid,
    organisms: all,
    tick: world.tick + 1,
    generation: world.generation,
    rngState: Math.floor(rng() * 2 ** 32),
  };
}

/**
 * Fallback fitness (used only by the stats dashboard / mutation advisor —
 * GoL tick never calls it for survival decisions).
 * Rewards cells that have been alive a long time (stable patterns score high).
 */
export const gameOfLifeFitness: FitnessFunction = (organism) =>
  organism.alive ? organism.age : 0;

export const gameOfLifeConfig: SimConfig = createConfig({
  width: 50,
  height: 50,
  populationSize: 400,   // ~16 % density — enough for interesting patterns
  carryingCapacity: 2500, // 50×50 = 2500 max cells
  mutationRate: 0,
  crossoverRate: 0,
  crossoverType: "single-point",
  selectionType: "tournament",
  elitismCount: 0,
  tournamentSize: 2,
  genomeSchema: {
    length: 9,
    genes: Array(9).fill({ type: "boolean" }),
  },
  energyPerTick: 0,
  energyGainPerTick: 0,
  reproductionThreshold: 0,
  seed: 42,
});

import { createWorld, tick } from "../../core/World";
import { gameOfLifeConfig } from "../../presets/gameOfLife";

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
});

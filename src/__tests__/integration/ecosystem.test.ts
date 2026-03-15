import { createWorld, tick } from "../../core/World";
import { ecosystemConfig } from "../../presets/ecosystem";

describe("Ecosystem preset integration", () => {
  it("world initialises without error", () => {
    expect(() => createWorld(ecosystemConfig)).not.toThrow();
  });

  it("population stays within carrying capacity after 10 ticks", () => {
    let world = createWorld(ecosystemConfig);
    for (let i = 0; i < 10; i++) {
      world = tick(world);
    }
    expect(world.organisms.length).toBeLessThanOrEqual(ecosystemConfig.carryingCapacity);
  });
});

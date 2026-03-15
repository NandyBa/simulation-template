import { sandboxFitnessFunction, validateFunctionBody } from "../../agents/sandbox";

describe("Fitness Designer sandbox", () => {
  it("returns valid function from safe body", () => {
    const fn = sandboxFitnessFunction("return organism.energy * 2;");
    const mockOrg = { energy: 5, alive: true, age: 1, genome: [], position: [0,0] as [number,number], id: "x", traits: {} };
    expect(fn(mockOrg, {} as never)).toBe(10);
  });

  it("rejects body that reassigns grid", () => {
    expect(() => sandboxFitnessFunction("grid = []; return 0;")).toThrow("unsafe");
  });

  it("rejects body with eval", () => {
    expect(() => sandboxFitnessFunction("eval('1+1'); return 0;")).toThrow("unsafe");
  });

  it("rejects body with fetch", () => {
    expect(() => sandboxFitnessFunction("fetch('http://evil.com'); return 0;")).toThrow("unsafe");
  });
});

describe("validateFunctionBody", () => {
  it("passes safe body", () => {
    expect(() => validateFunctionBody("return organism.age;")).not.toThrow();
  });

  it("throws on process access", () => {
    expect(() => validateFunctionBody("return process.env.SECRET;")).toThrow("unsafe");
  });
});

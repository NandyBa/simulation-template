import { fitnessDesignerAgent } from "../../agents/fitnessDesigner";
import { sandboxFitnessFunction, validateFunctionBody } from "../../agents/sandbox";
import type { Organism } from "../../core/types";

// Mock callSubAgent so import.meta.env (Vite-only) is never evaluated in Jest
jest.mock("../../agents/callSubAgent", () => ({
  callSubAgent: jest.fn(),
}));

import { callSubAgent } from "../../agents/callSubAgent";
const mockCallSubAgent = callSubAgent as jest.MockedFunction<typeof callSubAgent>;

const mockOrg: Organism = {
  id: "x",
  genome: [],
  position: [0, 0],
  energy: 50,
  age: 3,
  traits: {},
  alive: true,
};

afterEach(() => jest.clearAllMocks());

describe("fitnessDesignerAgent", () => {
  it("returns a FitnessDesignerResult with fn and body", async () => {
    mockCallSubAgent.mockImplementationOnce(async (_s, _u, parse) =>
      parse("return organism.energy * 2;")
    );
    const result = await fitnessDesignerAgent("reward high energy");
    expect(typeof result.fn).toBe("function");
    expect(result.fn(mockOrg, {} as never)).toBe(100);
    expect(typeof result.body).toBe("string");
    expect(result.body.length).toBeGreaterThan(0);
  });

  it("passes the user goal as the user message", async () => {
    mockCallSubAgent.mockImplementationOnce(async (_s, _u, parse) =>
      parse("return 0;")
    );
    await fitnessDesignerAgent("survive as long as possible");
    expect(mockCallSubAgent).toHaveBeenCalledWith(
      expect.any(String),
      "survive as long as possible",
      expect.any(Function)
    );
  });

  it("propagates errors from callSubAgent", async () => {
    mockCallSubAgent.mockRejectedValueOnce(new Error("Ollama unavailable"));
    await expect(fitnessDesignerAgent("anything")).rejects.toThrow("Ollama unavailable");
  });

  it("generated function returns finite non-negative value for valid body", async () => {
    mockCallSubAgent.mockImplementationOnce(async (_s, _u, parse) =>
      parse("return organism.age + organism.energy;")
    );
    const { fn } = await fitnessDesignerAgent("reward age and energy");
    const score = fn(mockOrg, {} as never);
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe("Fitness Designer sandbox", () => {
  it("returns valid function from safe body", () => {
    const fn = sandboxFitnessFunction("return organism.energy * 2;");
    expect(fn(mockOrg, {} as never)).toBe(100);
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

  it("generated function returns finite non-negative value for valid body", () => {
    const fn = sandboxFitnessFunction("return organism.age + organism.energy;");
    const score = fn(mockOrg, {} as never);
    expect(Number.isFinite(score)).toBe(true);
    expect(score).toBeGreaterThanOrEqual(0);
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

import { mutationAdvisorAgent } from "../../agents/mutationAdvisor";
import type { AdvisorAdvice, PopulationStats } from "../../agents/mutationAdvisor";

jest.mock("../../agents/callSubAgent", () => ({
  callSubAgent: jest.fn(),
}));

import { callSubAgent } from "../../agents/callSubAgent";
const mockCallSubAgent = callSubAgent as jest.MockedFunction<typeof callSubAgent>;

const mockStats: PopulationStats = {
  generation: 5,
  populationSize: 40,
  avgFitness: 30,
  maxFitness: 80,
  minFitness: 5,
  fitnessStdDev: 15,
  topGenomes: [[0.1, 0.9], [0.5, 0.5]],
};

afterEach(() => jest.clearAllMocks());

describe("mutationAdvisorAgent — response validation", () => {
  it("returns valid AdvisorAdvice from a well-formed response", async () => {
    const payload: AdvisorAdvice = {
      mutationRate: 0.05,
      crossoverType: "uniform",
      selectionPressure: "medium",
      explanation: "Low diversity detected, increase mutation.",
    };
    // Simulate callSubAgent calling its parseResponse with valid JSON
    mockCallSubAgent.mockImplementationOnce(async (_sys, _usr, parse) =>
      parse(JSON.stringify(payload))
    );
    const advice = await mutationAdvisorAgent(mockStats);
    expect(advice.mutationRate).toBe(0.05);
    expect(advice.crossoverType).toBe("uniform");
    expect(advice.selectionPressure).toBe("medium");
    expect(typeof advice.explanation).toBe("string");
  });

  it("rejects advice with mutationRate > 1", async () => {
    mockCallSubAgent.mockImplementationOnce(async (_s, _u, parse) =>
      parse(JSON.stringify({ mutationRate: 1.5, crossoverType: "uniform", selectionPressure: "high", explanation: "x" }))
    );
    await expect(mutationAdvisorAgent(mockStats)).rejects.toThrow("out of bounds");
  });

  it("rejects advice with mutationRate < 0", async () => {
    mockCallSubAgent.mockImplementationOnce(async (_s, _u, parse) =>
      parse(JSON.stringify({ mutationRate: -0.1, crossoverType: "uniform", selectionPressure: "low", explanation: "x" }))
    );
    await expect(mutationAdvisorAgent(mockStats)).rejects.toThrow("out of bounds");
  });

  it("rejects malformed JSON response", async () => {
    mockCallSubAgent.mockImplementationOnce(async (_s, _u, parse) =>
      parse("not json at all")
    );
    await expect(mutationAdvisorAgent(mockStats)).rejects.toThrow();
  });

  it("rejects response missing mutationRate field", async () => {
    mockCallSubAgent.mockImplementationOnce(async (_s, _u, parse) =>
      parse(JSON.stringify({ crossoverType: "uniform", selectionPressure: "low", explanation: "x" }))
    );
    await expect(mutationAdvisorAgent(mockStats)).rejects.toThrow("invalid advice shape");
  });

  it("passes serialised stats as the user message", async () => {
    mockCallSubAgent.mockResolvedValueOnce({
      mutationRate: 0.01,
      crossoverType: "single-point",
      selectionPressure: "low",
      explanation: "ok",
    });
    await mutationAdvisorAgent(mockStats);
    const userMsg = (mockCallSubAgent.mock.calls[0] as unknown[])[1] as string;
    expect(JSON.parse(userMsg)).toMatchObject({ generation: 5, populationSize: 40 });
  });

  it("propagates errors from callSubAgent", async () => {
    mockCallSubAgent.mockRejectedValueOnce(new Error("Ollama unavailable"));
    await expect(mutationAdvisorAgent(mockStats)).rejects.toThrow("Ollama unavailable");
  });
});

describe("MutationAdvisor contract — AdvisorAdvice shape", () => {
  const validAdvice: AdvisorAdvice = {
    mutationRate: 0.05,
    crossoverType: "uniform",
    selectionPressure: "medium",
    explanation: "Diversity is low, increase mutation.",
  };

  it("mutationRate is in [0, 1]", () => {
    expect(validAdvice.mutationRate).toBeGreaterThanOrEqual(0);
    expect(validAdvice.mutationRate).toBeLessThanOrEqual(1);
  });

  it("crossoverType is a valid option", () => {
    expect(["single-point", "two-point", "uniform"]).toContain(validAdvice.crossoverType);
  });

  it("selectionPressure is a valid option", () => {
    expect(["low", "medium", "high"]).toContain(validAdvice.selectionPressure);
  });

  it("explanation is a non-empty string", () => {
    expect(typeof validAdvice.explanation).toBe("string");
    expect(validAdvice.explanation.length).toBeGreaterThan(0);
  });
});

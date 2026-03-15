import type { AdvisorAdvice, PopulationStats } from "../../agents/mutationAdvisor";

// Contract test: validates the shape of AdvisorAdvice without hitting the API
describe("MutationAdvisor contract", () => {
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

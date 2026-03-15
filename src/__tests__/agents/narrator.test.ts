import { narratorAgent } from "../../agents/narrator";
import { createWorld, defaultConfig } from "../../core/World";

jest.mock("../../agents/callSubAgent", () => ({
  callSubAgent: jest.fn(),
}));

import { callSubAgent } from "../../agents/callSubAgent";
const mockCallSubAgent = callSubAgent as jest.MockedFunction<typeof callSubAgent>;

const before = createWorld(defaultConfig);
const after = { ...before, generation: 1, tick: 10 };

afterEach(() => jest.clearAllMocks());

describe("narratorAgent", () => {
  it("returns a NarratorEntry with the correct generation", async () => {
    mockCallSubAgent.mockResolvedValueOnce({ generation: 1, text: "The population thrived." });
    const entry = await narratorAgent(before, after);
    expect(entry.generation).toBe(after.generation);
  });

  it("returns trimmed non-empty text", async () => {
    mockCallSubAgent.mockImplementationOnce(async (_s, _u, parse) =>
      parse("  Evolution unfolded swiftly.  ")
    );
    const entry = await narratorAgent(before, after);
    expect(entry.text).toBe("Evolution unfolded swiftly.");
  });

  it("passes a diff with population and generation fields as user message", async () => {
    mockCallSubAgent.mockResolvedValueOnce({ generation: 1, text: "Story." });
    await narratorAgent(before, after);
    const userMsg = (mockCallSubAgent.mock.calls[0] as unknown[])[1] as string;
    const diff = JSON.parse(userMsg);
    expect(diff).toHaveProperty("generationBefore");
    expect(diff).toHaveProperty("generationAfter");
    expect(diff).toHaveProperty("populationBefore");
    expect(diff).toHaveProperty("populationAfter");
  });

  it("uses after.generation in the returned entry", async () => {
    mockCallSubAgent.mockImplementationOnce(async (_s, _u, parse) =>
      parse("Something happened.")
    );
    const entry = await narratorAgent(before, after);
    expect(entry.generation).toBe(after.generation);
  });

  it("propagates errors from callSubAgent", async () => {
    mockCallSubAgent.mockRejectedValueOnce(new Error("model not found"));
    await expect(narratorAgent(before, after)).rejects.toThrow("model not found");
  });
});

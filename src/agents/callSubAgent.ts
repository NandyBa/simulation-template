import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic();

/**
 * Shared utility for all sub-agent calls.
 * Sends a message to Claude and returns the parsed result.
 */
export async function callSubAgent<T>(
  systemPrompt: string,
  userMessage: string,
  parseResponse: (raw: string) => T
): Promise<T> {
  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: "user", content: userMessage }],
  });

  const text = message.content
    .filter((b) => b.type === "text")
    .map((b) => (b as { type: "text"; text: string }).text)
    .join("\n");

  return parseResponse(text);
}

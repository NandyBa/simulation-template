/**
 * Shared utility for all sub-agent calls.
 * Uses the Ollama native API — no API key required.
 *
 * Configure via .env.local:
 *   VITE_OLLAMA_URL=http://localhost:11434   (default)
 *   VITE_OLLAMA_MODEL=llama3.2              (default)
 */

interface OllamaResponse {
  message: { role: string; content: string };
}

export async function callSubAgent<T>(
  systemPrompt: string,
  userMessage: string,
  parseResponse: (raw: string) => T
): Promise<T> {
  const base = (import.meta.env.VITE_OLLAMA_URL as string | undefined) ?? "http://localhost:11434";
  const model = (import.meta.env.VITE_OLLAMA_MODEL as string | undefined) ?? "llama3.2";

  const res = await fetch(`${base}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessage },
      ],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Ollama error ${res.status}: ${err}`);
  }

  const data = await res.json() as OllamaResponse;
  const text = data.message.content;

  return parseResponse(text);
}

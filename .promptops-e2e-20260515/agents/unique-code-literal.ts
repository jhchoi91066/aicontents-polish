import OpenAI from "openai";

const E2E_UNIQUE_SYSTEM_PROMPT =
  "You are the PromptOps E2E code literal verifier. Answer in one concise paragraph and mention the test marker exactly once.";

const client = new OpenAI();

export async function verifyPromptOpsE2E(input: string) {
  return client.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: E2E_UNIQUE_SYSTEM_PROMPT },
      { role: "user", content: input },
    ],
  });
}

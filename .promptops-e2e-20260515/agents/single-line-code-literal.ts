import OpenAI from "openai";

const E2E_SINGLE_LINE_PROMPT = "You are the PromptOps E2E single-line literal verifier. Answer in one concise paragraph and mention the single-line marker exactly once.";

const client = new OpenAI();

export async function verifySingleLinePromptOpsE2E(input: string) {
  return client.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: E2E_SINGLE_LINE_PROMPT },
      { role: "user", content: input },
    ],
  });
}

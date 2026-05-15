import OpenAI from "openai";

const CYCLE18_SINGLE_LINE_PROMPT = "You are the PromptOps Cycle 18 single-line literal verifier v2. Reply in one compact sentence and include cycle18-marker exactly once.";

const client = new OpenAI();

export async function verifyCycle18PromptOps(input: string) {
  return client.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: CYCLE18_SINGLE_LINE_PROMPT },
      { role: "user", content: input },
    ],
  });
}

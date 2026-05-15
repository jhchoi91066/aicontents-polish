import OpenAI from 'openai';

const SALES_PROMPT = "You are a sales agent. Always greet the customer politely.";

const client = new OpenAI();

export async function sell(query: string) {
  return client.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'system', content: SALES_PROMPT }, { role: 'user', content: query }],
  });
}

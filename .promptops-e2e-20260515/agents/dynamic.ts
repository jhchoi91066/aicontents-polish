import OpenAI from 'openai';

const HEADER = "You are a helpful assistant.";
const FOOTER = "Always be polite.";

function getInstructions(role: string): string {
  return `For ${role}, prioritise accuracy.`;
}

const client = new OpenAI();

export async function reply(role: string, input: string) {
  const SYSTEM = `${HEADER}\n${getInstructions(role)}\n${FOOTER}`;
  return client.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'system', content: SYSTEM }, { role: 'user', content: input }],
  });
}

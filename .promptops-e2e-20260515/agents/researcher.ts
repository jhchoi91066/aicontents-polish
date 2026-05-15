import { readFileSync } from 'fs';
import { join } from 'path';
import OpenAI from 'openai';

const SYSTEM_PROMPT = readFileSync(join(__dirname, '../prompts/system.md'), 'utf-8');

const client = new OpenAI();

export async function research(q: string) {
  return client.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'system', content: SYSTEM_PROMPT }, { role: 'user', content: q }],
  });
}

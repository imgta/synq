import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

const routeSchema = z.object({
  tool: z.enum(['classifyNAICS', 'findJVPartners', 'none']),
  reason: z.string(),
});

export async function routeQuery(userText: string) {
  const { object } = await generateObject({
    model: openai('gpt-4.1-nano'),
    temperature: 0,
    schema: routeSchema,
    prompt: `
You are a strict tool router. Choose exactly one:
- "classifyNAICS" only if the user gave a business/company description and wants NAICS mapping.
- "findJVPartners" only if the user references a specific lead company AND a specific opportunity (notice/solicitation/title).
- Otherwise "none".

User query: """${userText}"""
`});

  return object;
}
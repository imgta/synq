import { streamText, convertToModelMessages, tool, UIMessage } from 'ai';
import { drizzleDB, tables, sql } from '@/lib/db';
import { generateEmbedding } from '@/lib/embed';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { desc } from 'drizzle-orm';
import { NaicsClassificationResult, type NaicsClassificationProps } from '@/components/chat/naics-classify';

// export const runtime = 'edge';

interface StreamAIRequestBody {
  system: string;
  messages: UIMessage[];
  temperature: number;
  model: string;
}

export async function POST(req: Request) {
  const {
    model = 'gpt-4.1-nano',
    temperature = 0,
    system,
    messages,
  }: StreamAIRequestBody = await req.json();

  const result = streamText({
    model: openai(model),
    temperature,
    system,
    messages: convertToModelMessages(messages),
    tools: {
      naicsFromBusinessDescription: tool({
        description: 'Classifies a business based on its description, finding the most relevant North American Industry Classification System (NAICS) codes. Use this to identify the primary industry and related ancillary industries for a given company.',
        inputSchema: z.object({
          description: z.string().describe(
            'A detailed description of the business activities, products, or services. Should be at least one full sentence.'
          ),
        }),
        execute: async ({ description }) => {
          try {
            const similarCodes = await findSimilarNaicsCodes(description, 5);
            if (!similarCodes || similarCodes.length === 0) return { error: 'No relevant NAICS codes found.' };
            // structure data clearly for interpretation
            return {
              primaryNaics: similarCodes[0],
              ancillaryNaics: similarCodes.slice(1),
            };
          } catch (error) {
            console.error('Error classifying business:', error);
            return { error: 'An error occurred while processing the request.' };
          }
        },
      }),
      weather: tool({
        description: 'Get the weather in a location (fahrenheit)',
        inputSchema: z.object({
          location: z.string().describe('The location to get the weather for'),
        }),
        execute: async ({ location }) => {
          const temperature = Math.round(Math.random() * (90 - 32) + 32);
          return {
            location,
            temperature,
          };
        },
      }),
    },
  });
  return result.toUIMessageStreamResponse();
}


/**
 * Finds the most relevant NAICS codes for a given business description using vector similarity search.
 *
 * @param description The business description to classify.
 * @param limit The number of similar codes to return. Defaults to 5.
 * @returns A promise that resolves to an array of NAICS codes with their similarity score.
 */
export async function findSimilarNaicsCodes(description: string, limit = 5) {
  const db = drizzleDB();

  const queryVector = await generateEmbedding(description, { model: 'summary' });

  const similarity = sql<number>`1 - (${tables.naics.embedding_summary} <=> ${JSON.stringify(
    queryVector
  )})`;
  const results = await db
    .select({
      code: tables.naics.code,
      title: tables.naics.title,
      description: tables.naics.description,
      similarity,
    })
    .from(tables.naics)
    .orderBy(t => desc(t.similarity))
    .limit(limit);

  return results;
}
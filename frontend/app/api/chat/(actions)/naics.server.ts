'use server';

import { cosineDistance, inArray, desc, sql } from 'drizzle-orm';
import { generateOpenAiEmbedding } from '@/lib/embedding.server';
import { generateText, generateObject } from 'ai';
import { drizzleDB, tables } from '@/lib/db';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

/**
 * Finds relevant NAICS codes for a given business description using a hybrid scoring model
 * that combines semantic similarity with code specificity level.
 *
 * @param description The business description to classify.
 * @param limit The number of codes to return.
 * @returns A promise that resolves to an array of NAICS codes with their similarity and final score.
 */
export async function getNaicsCandidates(description: string, limit = 8) {
  const db = drizzleDB();
  const queryVector = await generateOpenAiEmbedding(description, { modelType: 'summary' });

  const similarity = sql<number>`1 - (${cosineDistance(tables.naics.embedding_summary, queryVector)})`;

  const specificityBonus = sql<number>`
CASE
  WHEN ${tables.naics.level} = 'national_industry' THEN 0.2
  WHEN ${tables.naics.level} = 'naics_industry' THEN 0.1
  ELSE 0
END`;

  const hybridScore = sql<number>`${similarity} + ${specificityBonus}`;

  const results = await db
    .select({
      code: tables.naics.code,
      level: tables.naics.level,
      title: tables.naics.title,
      description: tables.naics.description,
      similarity,
    })
    .from(tables.naics)
    .where(inArray(tables.naics.level, [
      'national_industry', // 6-digit
      'naics_industry', // 5-digit
      'industry_group', // 4-digit
    ]))
    .orderBy(desc(hybridScore))
    .limit(limit);

  return results;
}

export async function summarizeBusiness({ description, model = 'gpt-4.1-nano' }: { description: string; model?: string; }) {
  const { text } = await generateText({
    model: openai(model),
    prompt: `You are an expert business analyst specialized in writing in-depth documents that provide industry analysis and technical summary for a business based on its description. Your task is to analyze the business description and draft a formal, government official document with comprehensive analysis and details that describe the business.

Here's the business description:
<description>
${description}
</description>

Follow these guidelines:
1. Analyze the business description and focus on core economic activities and industry relevance and overlaps.
2. Write objectively, using formal, bureaucratic wording similar to government documents.
3. Do not include the business name or any specific NAICS codes.`,
  });
  return text;
}


type NaicsCandidates = {
  code: string;
  level: 'sector' | 'subsector' | 'industry_group' | 'naics_industry' | 'national_industry';
  title: string | null;
  description: string;
  similarity: number;
};
type SelectTopNaicsParams = {
  description: string;
  summary: string;
  candidates: NaicsCandidates[];
  model?: string;
};
export async function selectTopNaics({
  description,
  summary,
  candidates,
  model = 'gpt-4.1-nano',
}: SelectTopNaicsParams) {
  const { object } = await generateObject({
    model: openai(model),
    schema: z.object({
      selections: z.array(z.object({
        code: z.string(),
        level: z.string(),
        title: z.string(),
        justification: z.string('A brief explanation for why the NAICS code is a strong match for the business.'),
      })).length(5).describe('An array of the top 5 most relevant NAICS codes, re-ranked from the provided candidates.'),
    }),
    prompt: `You are an expert U.S. government contracting analyst. Your task is to provide a final, justified selection of NAICS codes based on the following briefing.

Original business description:
<description>
${description}
</description>

Expert analysis summary:
<summary>
${summary}
</summary>

Candidate NAICS codes:
<naics_codes>
${JSON.stringify(candidates, null, 2)}
</naics_codes>

**Important Instructions:**
1. Review all sections carefully to better understand the overall business industry and fit.
2. Select 5 highly specific NAICS codes from the candidate list that are most relevant to the business.
3. Write a concise justification for each selection:
  a. Justifications MUST connect concepts from the original description to language found in NAICS code descriptions.
  b. Expert analysis summaries can guide connections, but justifications are framed in terms of the original description for clarity.`,
  });
  return object.selections;
}
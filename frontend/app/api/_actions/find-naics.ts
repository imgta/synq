import { drizzleDB, tables } from '@/lib/db';
import { generateOpenAiEmbedding } from '@/lib/embedding';
import { cosineDistance, inArray, desc, sql } from 'drizzle-orm';

/**
 * Finds relevant NAICS codes for a given business description using a hybrid scoring model
 * that combines semantic similarity with code specificity level.
 *
 * @param description The business description to classify.
 * @param limit The number of codes to return.
 * @returns A promise that resolves to an array of NAICS codes with their similarity and final score.
 */
export async function findNaicsCandidates(description: string, limit = 8) {
  const db = drizzleDB();

  const queryVector = await generateOpenAiEmbedding(description, { model: 'summary' });

  const similarity = sql<number>`1 - (${cosineDistance(tables.naics.embedding_summary, queryVector)})`;

  const specificityBonus = sql<number>`
    CASE 
      WHEN ${tables.naics.level} = 'national_industry' THEN 0.2
      WHEN ${tables.naics.level} = 'naics_industry' THEN 0.1
      ELSE 0
    END
  `;
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
import { drizzleDB, tables, rootDir, inDev, sql, type NewNaics, type Naics } from '@/lib/db';
import { OpenAiEmbeddingModels } from '@/lib/embedding';
import { loadEnvConfig } from '@next/env';
import { consola } from 'consola';
import { apiFetch } from '@/api';

loadEnvConfig(rootDir, inDev);

export function createNaicsInput(naics: Naics): string {
  const parts: string[] = [];

  // Core Identity
  parts.push(`NAICS Code ${naics.code}: ${naics.title}`);

  if (naics.description) {
    const xRefMarker = 'Cross-References. Establishments primarily engaged in--';
    const markerIdx = naics.description.indexOf(xRefMarker);

    if (markerIdx !== -1) {
      // split string by cross reference marker
      const mainDescription = naics.description.substring(0, markerIdx).trim();
      const xRefs = naics.description.substring(markerIdx + xRefMarker.length).trim();

      parts.push(`Official Description: ${mainDescription}`);
      // dedicated section for cross references
      parts.push(`\nIndustry Cross-References:\n${xRefs}`);
    } else {
      parts.push(`Official Description: ${naics.description}`);
    }
  }

  // Industry Classification & Hierarchy
  const hierarchyDetails: string[] = [];
  if (naics.level) hierarchyDetails.push(`Level: ${naics.level}`);

  if (naics.sector) hierarchyDetails.push(`Sector: ${naics.sector}`);

  if (hierarchyDetails.length > 0) parts.push(`\nIndustry Classification:\n- ${hierarchyDetails.join('\n- ')}`);

  // Business Qualification Context
  if (naics.size_standard_metric && naics.size_standard_max) {
    const value = naics.size_standard_metric === 'receipts'
      ? new Intl.NumberFormat('en-US', { // format as millions of dollars
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 1,
      }).format(naics.size_standard_max / 1_000_000) + ' million'
      : new Intl.NumberFormat('en-US').format(naics.size_standard_max); // format with commas
    const metric = naics.size_standard_metric;
    parts.push(`\nSmall Business Qualification Standard: A business in this industry is considered "small" if it has up to ${value} in average annual ${metric}.`);
  }

  // Domain-Specific Relevance
  if (naics.defense_related) {
    parts.push(`\nDefense Sector Relevance: This industry has been identified as highly relevant to U.S. defense and national security contracts.`);
  }

  return parts.join('\n\n');
}

export async function seedNAICS() {
  consola.start('Seeding NAICS data from census.gov, sba.gov...');

  const { data } = await apiFetch('/naics/data');
  const naicsData = data.lookups.naics.filter((n: NewNaics) => n && n.code);

  const EMBEDDING_BATCH_SIZE = 100;
  const records: NewNaics[] = [];

  consola.info(`Generating ${naicsData.length} embeddings...`);

  for (let i = 0; i < naicsData.length; i += EMBEDDING_BATCH_SIZE) {
    const chunk = naicsData.slice(i, i + EMBEDDING_BATCH_SIZE);

    const embeddedChunk = await Promise.all(
      chunk.map(async (n: NewNaics) => {
        const embeddingText = createNaicsInput(n as Naics);
        const vector = await generateOpenAiEmbedding(embeddingText, { model: 'summary' });
        return {
          ...n,
          embedding_summary: vector,
        };
      })
    );

    records.push(...embeddedChunk);
    const progress = Math.min(i + EMBEDDING_BATCH_SIZE, naicsData.length);
    consola.info(`${progress}/${naicsData.length} embeddings generated`);

    // small delay to prevent file system overwhelm
    await new Promise(resolve => setTimeout(resolve, 50));
  }

  const db = drizzleDB();
  consola.info(`Upserting ${records.length} NAICS code records...`);

  await db.transaction(async tx => {
    const batchSize = 300;
    for (let i = 0; i < records.length; i += batchSize) {
      const chunk = records.slice(i, i + batchSize);
      await tx.insert(tables.naics)
        .values(chunk)
        .onConflictDoUpdate({
          target: tables.naics.code,
          set: {
            description: sql`excluded.description`,
            title: sql`excluded.title`,
            size_standard_metric: sql`excluded.size_standard_metric`,
            size_standard_max: sql`excluded.size_standard_max`,
            related_codes: sql`excluded.related_codes`,
            cross_ref_count: sql`excluded.cross_ref_count`,
            defense_related: sql`excluded.defense_related`,
            defense_keyword_count: sql`excluded.defense_keyword_count`,
            validated: sql`excluded.validated`,
            change_indicator: sql`excluded.change_indicator`,
            embedding_summary: sql`excluded.embedding_summary`,
            updated_at: new Date(),
          },
        });

      consola.info(`Upsert batch ${i / batchSize + 1} / ${Math.ceil(records.length / batchSize)}`);
    }
  });
  consola.success(`Seeded data for ${records.length} NAICS codes.`);
}

async function main() {
  try {
    await seedNAICS();
    process.exit(0);
  } catch (error) {
    consola.error(error);
    process.exit(1);
  }
}
main();
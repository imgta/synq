import { drizzleDB, tables, rootDir, inDev, sql, type NewNaics } from '@/lib/db';
import { generateEmbedding } from '@/lib/embed';
import { loadEnvConfig } from '@next/env';
import { consola } from 'consola';
import { apiFetch } from '@/api';

loadEnvConfig(rootDir, inDev);

export async function seedNAICS() {
  consola.start('Seeding NAICS data from census.gov, sba.gov...');
  const { data } = await apiFetch('/naics/data');
  const naicsData = data.lookups.naics.filter((n: NewNaics) => n && n.code);

  const records: NewNaics[] = [];
  const EMBEDDING_CONCURRENCY = 100;

  consola.info(`Generating ${naicsData.length} embeddings...`);
  for (let i = 0; i < naicsData.length; i += EMBEDDING_CONCURRENCY) {
    const chunk = naicsData.slice(i, i + EMBEDDING_CONCURRENCY);

    const embeddedChunk = await Promise.all(
      chunk.map(async (n: NewNaics) => {
        const embeddingText = `${n.title}: ${n.description}`;
        const vector = await generateEmbedding(embeddingText);
        return {
          code: n.code,
          description: n.description,
          title: n.title,
          level: n.level,
          sector: n.sector,
          subsector: n.subsector,
          industry_group: n.industry_group,
          industry: n.industry,
          size_standard_metric: n.size_standard_metric,
          size_standard_max: n.size_standard_max,
          related_codes: n.related_codes,
          cross_ref_count: n.cross_ref_count,
          defense_related: n.defense_related,
          defense_keyword_count: n.defense_keyword_count,
          validated: n.validated,
          change_indicator: n.change_indicator,
          embedding: vector,
        };
      })
    );
    records.push(...embeddedChunk);
    consola.info(`Processed embeddings for ${records.length} / ${naicsData.length} codes`);
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
            embedding: sql`excluded.embedding`,
            updated_at: new Date(),
          },
        });
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
import { drizzleDB, tables, inDev, rootDir } from '@/lib/db';
import { MOCK_OPPORTUNITIES } from "@/lib/db/mock";
import { generateEmbedding } from '@/lib/embed';
import { loadEnvConfig } from '@next/env';
import { consola } from 'consola';

loadEnvConfig(rootDir, inDev);

export async function seedOpportunities() {
  consola.start('Seeding OPPORTUNITIES...');

  const records = await Promise.all(
    MOCK_OPPORTUNITIES.map(async opp => ({
      ...opp,
      embedding: await generateEmbedding(`${opp.title} ${opp.description}`),
    }))
  );

  const db = drizzleDB();
  const inserts = await db.insert(tables.opportunities).values(records).returning({ id: tables.opportunities.id });
  if (!inserts.length) consola.error('Insert Error');

  consola.success(`Seeded ${MOCK_OPPORTUNITIES.length} opportunities`);
}

async function main() {
  try {
    await seedOpportunities();
    process.exit(0);
  } catch (error) {
    consola.error(error);
    process.exit(1);
  }
}
main();
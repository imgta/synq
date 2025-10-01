import { drizzleDB, tables, inDev, rootDir, type NewAward } from '@/lib/db';
import { MOCK_AWARDS } from '@/lib/db/mock-data';
import { loadEnvConfig } from '@next/env';
import { consola } from 'consola';

loadEnvConfig(rootDir, inDev);

export async function seedAwards() {
  consola.start('Seeding AWARDS...');

  const db = drizzleDB();
  const inserts = await db.insert(tables.awards)
    .values(MOCK_AWARDS as NewAward[])
    .returning({ id: tables.awards.id });
  if (!inserts.length) consola.error('Insert Error');

  consola.success(`Seeded ${inserts.length} awards`);
}

async function main() {
  try {
    await seedAwards();
    process.exit(0);
  } catch (error) {
    consola.error(error);
    process.exit(1);
  }
}
main();
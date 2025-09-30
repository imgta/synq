import { drizzleDB, tables, inDev, rootDir, type NewProgram } from '@/lib/db';
import { MOCK_PROGRAMS } from '@/lib/db/mock';
import { loadEnvConfig } from '@next/env';
import { consola } from 'consola';

loadEnvConfig(rootDir, inDev);

export async function seedPrograms() {
  consola.start('Seeding PROGRAMS...');

  const db = drizzleDB();
  const inserts = await db.insert(tables.programs)
    .values(MOCK_PROGRAMS as NewProgram[])
    .returning({ id: tables.programs.id })
    .onConflictDoNothing();
  if (!inserts.length) consola.error('Insert Error');

  consola.success(`Seeded ${inserts.length} programs`);
}

async function main() {
  try {
    await seedPrograms();
    process.exit(0);
  } catch (error) {
    consola.error(error);
    process.exit(1);
  }
}
main();
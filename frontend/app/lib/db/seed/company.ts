import { drizzleDB, tables, inDev, rootDir, type NewCompany } from '@/lib/db';
import { generateEmbedding } from '@/lib/embed';
import { MOCK_COMPANIES } from '@/lib/db/mock';
import { loadEnvConfig } from '@next/env';
import { consola } from 'consola';

loadEnvConfig(rootDir, inDev);

export type SBACertification = // socio-economic status certifications
  '8A'       // 8(a) Business Development program
  | 'WOSB'   // Women-Owned Small Business
  | 'EDWOSB' // Economically Disadvantaged WOSB
  | 'VOSB'   // Veteran-Owned Small Business
  | 'SDVOSB' // Service-Disabled VOSB
  | 'HZ';    // HUBZone (Historically Underutilized Business Zones)

export async function seedCompanies() {
  consola.start('Seeding COMPANIES...');

  const records = await Promise.all(
    MOCK_COMPANIES.map(async co => ({
      ...co,
      embedding: await generateEmbedding(co.description)
    }))
  ) as NewCompany[];

  const db = drizzleDB();
  const inserts = await db.insert(tables.companies).values(records).returning({ name: tables.companies.name });
  if (!inserts.length) consola.error('Insert Error');

  consola.success(`Seeded ${inserts.length} companies`);
}

async function main() {
  try {
    await seedCompanies();
    process.exit(0);
  } catch (error) {
    consola.error(error);
    process.exit(1);
  }
}
main();
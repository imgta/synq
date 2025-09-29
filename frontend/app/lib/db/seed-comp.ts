import { drizzleDB, tables, inDev, rootDir, type NewCompany } from '@/lib/db';
import { generateEmbedding } from '@/lib/embed';
import { mockCompanies } from '@/lib/db/mock';
import { loadEnvConfig } from '@next/env';
import { consola } from 'consola';

loadEnvConfig(rootDir, inDev);

async function seedCompanies() {
  consola.start('Starting database seed...');
  const companies: NewCompany[] = await Promise.all(
    mockCompanies.map(async (co, idx) => {
      const vector = await generateEmbedding(co.description);
      return {
        name: co.name,
        description: co.description,
        primary_naics: co.primary_naics,
        other_naics: co.other_naics,
        uei: `MOCK-${idx}`,
        set_asides: co.set_asides,
        employee_count: co.employee_count,
        annual_revenue: co.annual_revenue,
        embedding: vector,
      };
    })
  );

  const db = drizzleDB();
  const inserts = await db.transaction(async tx => {
    return tx
      .insert(tables.companies)
      .values(companies)
      .onConflictDoNothing({ target: tables.companies.uei })
      .returning({ id: tables.companies.id, name: tables.companies.name });
  });
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
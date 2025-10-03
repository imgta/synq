import { drizzleDB, tables, inDev, rootDir, type NewProgram } from '@/lib/db';
import { MOCK_PROGRAMS } from '@/lib/db/mock';
import { generateOpenAiEmbedding } from '@/lib/embedding';
import { loadEnvConfig } from '@next/env';
import { consola } from 'consola';

loadEnvConfig(rootDir, inDev);

type MockProgram = (typeof MOCK_PROGRAMS)[number];

export function createProgramInput(prog: MockProgram): string {
  const parts: string[] = [];
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });
  // Section 1: Core Identity
  parts.push(`Major Defense Program Profile: ${prog.name} (Code: ${prog.code})`);
  // Section 2: Program Description
  if (prog.description) {
    parts.push(`\nProgram Description:\n${prog.description}`);
  }
  // Section 3: Key Program Details (Structured Data)
  const details: string[] = [];
  if (prog.estimated_value) {
    details.push(`Total Estimated Value: ${currencyFormatter.format(prog.estimated_value)}`);
  }
  if (prog.key_naics?.length) {
    details.push(`Key Industries (NAICS): ${prog.key_naics.join(', ')}`);
  }
  if (prog.prime_contractors?.length) {
    details.push(`Major Prime Contractors: ${prog.prime_contractors.join(', ')}`);
  }
  if (details.length > 0) {
    parts.push(`\nProgram Snapshot:\n- ${details.join('\n- ')}`);
  }
  return parts.join('\n');
}


export async function seedPrograms() {
  consola.start('Seeding PROGRAMS...');
  const records = await Promise.all(
    MOCK_PROGRAMS.map(async (prog) => {
      const profileText = createProgramInput(prog);
      const vector = await generateOpenAiEmbedding(profileText, { model: 'summary' });

      return {
        ...prog,
        embedding_summary: vector,
      };
    })
  ) as NewProgram[];

  const db = drizzleDB();

  const inserts = await db.insert(tables.programs)
    .values(records)
    .returning({ id: tables.programs.id });
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
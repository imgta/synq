import { drizzleDB, tables, inDev, rootDir, eq } from '@/lib/db';
import { MOCK_OPPORTUNITIES } from "@/lib/db/mock-data";
import { generateEmbedding } from '@/lib/embed';
import { loadEnvConfig } from '@next/env';
import { consola } from 'consola';

loadEnvConfig(rootDir, inDev);

type MockOpportunity = (typeof MOCK_OPPORTUNITIES)[number];
export function createOpportunityProfileInput(opp: MockOpportunity): string {
  const parts: string[] = [];
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  // Section 1: Core Identity
  parts.push(`Contract Opportunity: ${opp.title}`);
  if (opp.solicitation_number) {
    parts.push(`Solicitation #: ${opp.solicitation_number}`);
  }
  if (opp.full_parent_path_name) {
    parts.push(`Issuing Agency: ${opp.full_parent_path_name.replaceAll('.', ' > ')}`);
  }

  // Section 2: Core Description
  if (opp.description) {
    parts.push(`\nSummary of Work:\n${opp.description}`);
  }

  // Section 3: Key Contract Details (Structured Data)
  const details: string[] = [];
  if (opp.naics_code) {
    details.push(`Primary NAICS Code: ${opp.naics_code}`);
  }
  if (opp.secondary_naics?.length) {
    details.push(`Ancillary NAICS Codes: ${opp.secondary_naics.join(', ')}`);
  }
  if (opp.set_aside_description) {
    details.push(`Set-Aside Status: ${opp.set_aside_description}`);
  } else {
    details.push('Set-Aside Status: Full and Open Competition');
  }
  if (opp.estimated_value) {
    details.push(`Estimated Value: ${currencyFormatter.format(opp.estimated_value)}`);
  }
  if (opp.response_deadline) {
    details.push(`Response Deadline: ${opp.response_deadline.toLocaleDateString()}`);
  }
  if (details.length > 0) {
    parts.push(`\nContract Snapshot:\n- ${details.join('\n- ')}`);
  }
  // Section 4: High-Signal Requirements (AI-Extracted)
  if (opp.key_requirements?.length) {
    parts.push(`\nMandatory Requirements:\n- ${opp.key_requirements.join('\n- ')}`);
  }
  return parts.join('\n');
}


export async function seedOpportunities() {
  consola.start('Seeding OPPORTUNITIES...');
  const records = [];
  for (const [idx, opp] of MOCK_OPPORTUNITIES.entries()) {
    consola.info(`Processing opportunity ${idx + 1}/${MOCK_OPPORTUNITIES.length}: ${opp.title}`);

    // generate 384-dim summary embedding using 'summary' model
    const summaryProfileText = createOpportunityProfileInput(opp);
    const summaryVector = await generateEmbedding(summaryProfileText, { model: 'summary' });

    // generate 768-dim fulltext embedding using 'fulltext' model
    const fulltextVector = await generateEmbedding(opp.description, { model: 'fulltext' });

    records.push({
      ...opp,
      embedding_summary: summaryVector,
      embedding_fulltext: fulltextVector,
    });
  }

  const db = drizzleDB();

  const inserts = await db.insert(tables.opportunities)
    .values(records)
    .returning({ id: tables.opportunities.id });
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


// for (const r of records) {
//   const update = await db.update(tables.opportunities)
//     .set({ estimated_value: r.estimated_value })
//     .where(eq(tables.opportunities.notice_id, r.notice_id))
//     .returning({ title: tables.opportunities.title });
//   if (!update) consola.error('Update error');
// }
// consola.success(`Updated!`);
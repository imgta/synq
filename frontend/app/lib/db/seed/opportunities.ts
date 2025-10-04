import { drizzleDB, tables, inDev, rootDir, eq } from '@/lib/db';
import { MOCK_OPPORTUNITIES, EXTENDED_MOCK_OPPORTUNITIES } from "@/lib/db/mock/opportunities";
import { generateOpenAiEmbedding } from '@/lib/embedding.server';
import { loadEnvConfig } from '@next/env';
import { consola } from 'consola';

loadEnvConfig(rootDir, inDev);

type MockOpportunity = (typeof EXTENDED_MOCK_OPPORTUNITIES)[number];

export function createOpportunityInput(opp: MockOpportunity): string {
  const parts: string[] = [];
  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  // Core Identity
  parts.push(`Contract Opportunity: ${opp.title}`);
  if (opp.solicitation_number) {
    parts.push(`Solicitation #: ${opp.solicitation_number}`);
  }
  if (opp.full_parent_path_name) {
    parts.push(`Issuing Agency: ${opp.full_parent_path_name.replaceAll('.', ' > ')}`);
  }

  // Core Description
  if (opp.description) {
    parts.push(`\nSummary of Work:\n${opp.description}`);
  }

  // Key Contract Details (Structured Data)
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

  // High-Signal Requirements (AI-Extracted)
  if (opp.key_requirements?.length) {
    parts.push(`\nMandatory Requirements:\n- ${opp.key_requirements.join('\n- ')}`);
  }
  return parts.join('\n');
}

export async function seedOpportunities(mockOpps: MockOpportunity[]) {
  consola.start('Seeding OPPORTUNITIES...');
  const records = [];
  for (const [idx, opp] of mockOpps.entries()) {
    consola.info(`Processing opportunity ${idx + 1}/${mockOpps.length}: ${opp.title}`);

    // generate 384-dim summary embedding using 'summary' model
    const summaryProfileText = createOpportunityInput(opp);
    const summaryVector = await generateOpenAiEmbedding(summaryProfileText, { model: 'summary' });

    // generate 768-dim fulltext embedding using 'fulltext' model
    const fulltextVector = await generateOpenAiEmbedding(opp.description, { model: 'fulltext' });

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
  consola.success(`Seeded ${mockOpps.length} opportunities`);
}

async function main() {
  try {
    await seedOpportunities(EXTENDED_MOCK_OPPORTUNITIES);
    process.exit(0);
  } catch (error) {
    consola.error(error);
    process.exit(1);
  }
}
main();
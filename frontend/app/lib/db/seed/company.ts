import { drizzleDB, tables, inDev, rootDir, type NewCompany } from '@/lib/db';
import { generateEmbedding } from '@/lib/embed';
import { MOCK_COMPANIES } from '@/lib/db/mock-data';
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

type MockCompany = (typeof MOCK_COMPANIES)[number];

export function createCompanyProfileInput(co: MockCompany): string {
  const parts: string[] = [];

  // Section 1: Core Identity and Description
  parts.push(`Company Profile: ${co.name}`);
  parts.push(`Core Business Description: ${co.description}`);

  // Section 2: Capabilities & Industry Classification
  const capabilities: string[] = [];
  if (co.primary_naics) {
    capabilities.push(`Primary Industry (NAICS): ${co.primary_naics}`);
  }
  if (co.other_naics?.length) {
    capabilities.push(`Other Industries (NAICS): ${co.other_naics.join(', ')}`);
  }
  if (capabilities.length > 0) {
    parts.push(`\nKey Capabilities & Classifications:\n- ${capabilities.join('\n- ')}`);
  }

  // Section 3: Qualifications and Certifications
  const qualifications: string[] = [];
  if (co.sba_certifications?.length) {
    qualifications.push(`SBA Set-Aside Certifications: ${co.sba_certifications.join(', ')}`);
  }
  if (co.certifications?.length) {
    qualifications.push(`Industry & Quality Certifications: ${co.certifications.join(', ')}`);
  }
  if (qualifications.length > 0) {
    parts.push(`\nQualifications & Designations:\n- ${qualifications.join('\n- ')}`);
  }

  // Section 4: Corporate Size & Scale
  const snapshot: string[] = [];
  if (co.employee_count) snapshot.push(`Company Size: ${co.employee_count} employees`);

  if (co.annual_revenue) {
    const formattedRevenue = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(co.annual_revenue);
    snapshot.push(`Annual Revenue: ${formattedRevenue}`);
  }
  if (snapshot.length > 0) parts.push(`\nCorporate Snapshot:\n- ${snapshot.join('\n- ')}`);

  // Section 5: Past Performance
  if (co.past_performance) {
    const performanceNotes: string[] = [];
    if (co.past_performance.rating) {
      performanceNotes.push(`Historical Performance Rating: ${co.past_performance.rating} out of 5`);
    }
    if (co.past_performance.notable_contracts?.length) {
      performanceNotes.push(`Notable Past Contracts: ${co.past_performance.notable_contracts.join('; ')}`);
    }
    if (performanceNotes.length > 0) {
      parts.push(`\nPast Performance Highlights:\n- ${performanceNotes.join('\n- ')}`);
    }
  }
  return parts.join('\n\n');
}

export async function seedCompanies() {
  consola.start('Seeding COMPANIES...');
  const records = await Promise.all(
    MOCK_COMPANIES.map(async co => {
      const embeddingText = createCompanyProfileInput(co);
      const vector = await generateEmbedding(embeddingText, { model: 'summary' });

      return {
        ...co,
        embedding_summary: vector,
      };
    })
  ) as NewCompany[];

  const db = drizzleDB();
  consola.info(`Upserting ${records.length} companies...`);

  const inserts = await db.insert(tables.companies)
    .values(records)
    .returning({ name: tables.companies.name });
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
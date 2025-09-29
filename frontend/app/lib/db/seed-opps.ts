import { drizzleDB, tables, inDev, rootDir } from '@/lib/db';
import { mockOpportunities } from "@/lib/db/mock";
import { generateEmbedding } from '@/lib/embed';
import { loadEnvConfig } from '@next/env';
import { consola } from 'consola';

loadEnvConfig(rootDir, inDev);

async function seedOpportunities() {
  consola.start('Seeding opportunities...');

  const db = drizzleDB();
  for (const opp of mockOpportunities) {
    const embedding = await generateEmbedding(opp.description);
    const allNaics = opp.naicsCodes;

    // transform camelCase to snake_case
    const pointOfContact = opp.pointOfContact.map(contact => ({
      type: contact.type,
      title: contact.title || undefined, // null to undefined
      full_name: contact.fullName,
      email: contact.email,
      phone: contact.phone,
      fax: '',
    }));

    await db.insert(tables.opportunities).values({
      notice_id: opp.noticeId,
      solicitation_number: opp.solicitationNumber,
      title: opp.title,
      description: opp.description,
      type: opp.type,
      base_type: opp.baseType,
      archive_type: opp.archiveType,
      archive_date: new Date(opp.archiveDate),

      // NAICS deduplication
      naics_code: allNaics[0],
      secondary_naics: allNaics.slice(1),

      classification_code: opp.classificationCode,
      set_aside_code: opp.typeOfSetAside,
      set_aside_description: opp.typeOfSetAsideDescription,

      posted_date: new Date(opp.postedDate),
      response_deadline: opp.responseDeadLine ? new Date(opp.responseDeadLine) : null,

      full_parent_path_name: opp.fullParentPathName,
      full_parent_path_code: opp.fullParentPathCode,
      organization_type: opp.organizationType,
      office_address: opp.officeAddress,
      place_of_performance: opp.placeOfPerformance,

      point_of_contact: pointOfContact,
      ui_link: opp.uiLink,
      resource_links: opp.resourceLinks || [],

      active: opp.active === 'Yes',
      embedding,
      raw_data: opp,
    }).onConflictDoNothing({ target: tables.opportunities.notice_id });
  }
  consola.success(`Seeded ${mockOpportunities.length} opportunities`);
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
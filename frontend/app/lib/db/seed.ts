import { loadEnvConfig } from '@next/env';
import path from 'path';

const rootDir = path.resolve(__dirname, '../../../../');
const inDev = process.env.NODE_ENV !== 'production';
loadEnvConfig(rootDir, inDev);

import { drizzleDB, PGDatabase, tables, type NewCompany } from '@/lib/db';
import { generateEmbedding } from '@/lib/ai';

export const mockCompanies = [
  {
    name: "Contrail Analytics",
    description: "Contrail Analytics develops flight data monitoring and anomaly detection systems for unmanned aerial vehicles (UAVs) and aerospace fleets. We integrate advanced telemetry analytics with predictive maintenance algorithms, enabling early identification of risks before they become failures. Our platforms enhance mission safety, extend aircraft lifespans, and support both defense and civilian aviation programs with reliable, realtime insights required of high-stakes airspace operations.",
    primary_naics: "541712", // Research and Development in the Physical, Engineering, and Life Sciences
    other_naics: ["336411", "541511", "541513"],
    set_asides: ["SB"],
    employee_count: 85,
    annual_revenue: 12_000_000
  },
  {
    name: "Terra Sift",
    description: "Terra Sift specializes in environmental cleanup for hazardous contaminants including PFAS and heavy metals. We deploy advanced bio-filtration and advanced sequestration chemistry that restore groundwater and soil across military bases, industrial sites, and public lands. Our expertise ensures strict regulatory compliance while aligning with long-term federal sustainability and mission-critical objectives.",
    primary_naics: "562910", // Remediation Services
    other_naics: ["541620", "541380"],
    set_asides: ["SB", "8a"],
    employee_count: 120,
    annual_revenue: 18_500_000
  },
  {
    name: "VetConnect Telehealth",
    description: "VetConnect Telehealth delivers secure telemedicine solutions designed for working animals in federal service. Our secure telehealth platform enables military bases and rural agencies to access real-time veterinary care, including video diagnostics, digital records, and e-prescriptions. Integrated cybersecurity safeguards ensure the protection of sensitive data while supporting the health and performance of service animals.",
    primary_naics: "541511", // Custom Computer Programming Services
    other_naics: ["621910", "541512"],
    set_asides: ["SB", "VO"],
    employee_count: 45,
    annual_revenue: 6_200_000
  },
  {
    name: "OnBlur Inc.",
    description: "OnBlur Inc. provides AI-driven e-discovery and redaction services for federal agencies handling sensitive documents. Its platform automates the removal of personally identifiable information (PII) and classified content, streamlining FOIA responses, litigation workflows, and investigative reviews. Automated compliance features preserve information security and reduce the time and cost of large-scale document processing.",
    primary_naics: "541511", // Custom Computer Programming Services
    other_naics: ["541512", "541519"],
    set_asides: ["SB"],
    employee_count: 35,
    annual_revenue: 4_800_000
  },
  {
    name: "Tristimuli",
    description: "Tristimuli creates VR and AR-based training environments that replicate real-world crisis scenarios. The company designs immersive modules that prepare first responders, TSA officers, and emergency managers in lifelike but controlled environments. Experiential learning combined with performance analytics improves readiness, reduces training costs, and strengthens response effectiveness.",
    primary_naics: "541511", // Custom Computer Programming Services
    other_naics: ["611430", "541512"],
    set_asides: ["SB", "WO"],
    employee_count: 65,
    annual_revenue: 8_900_000
  },
  {
    name: "Stylefoam Solutions",
    description: "Stylefoam Solutions manufactures biodegradable and compostable packaging engineered for durability in field operations. Products replace single-use plastics in MREs, logistics supply kits, and cafeteria services, reducing waste while maintaining reliability. Material science innovation and scalable production capabilities support compliance with federal sustainability mandates and long-term environmental objectives.",
    primary_naics: "326111", // Plastics Bag and Pouch Manufacturing
    other_naics: ["325211", "541712"],
    set_asides: ["SB", "8a"],
    employee_count: 150,
    annual_revenue: 22_000_000
  },
  {
    name: "Synonym Bio",
    description: "Synonym Bio conducts techno-economic analysis to evaluate the scalability and cost efficiency of biomanufacturing processes. Modeling efforts assess emerging feedstocks, enzymes, and synthetic biology pathways, identifying bottlenecks and guiding resource allocation. Insights enable federal agencies and partners to evaluate commercialization pathways and transition from lab-scale to industrial-scale bioproduction.",
    primary_naics: "541712", // Research and Development in the Physical, Engineering, and Life Sciences
    other_naics: ["541618", "325414"],
    set_asides: ["SB"],
    employee_count: 25,
    annual_revenue: 3_200_000
  },
  {
    name: "ZeroDay Cybersecurity",
    description: "ZeroDay Cybersecurity delivers comprehensive defensive and compliance-focused cybersecurity services. Capabilities include red teaming, penetration testing, incident response, and managed compliance aligned with frameworks such as FISMA and CMMC. Cleared experts combine technical depth with regulatory knowledge to maintain resilient, mission-critical systems across defense and intelligence environments.",
    primary_naics: "541512", // Computer Systems Design Services
    other_naics: ["541513", "541519"],
    set_asides: ["SB", "VO"],
    employee_count: 180,
    annual_revenue: 28_000_000
  },
  {
    name: "AgSense Systems",
    description: "AgSense Systems offers drone-based multispectral imaging and AI-powered analytics for precision agriculture and land management. Solutions enable monitoring of crop health, soil conditions, and pest dynamics at scale to inform USDA, NRCS, and federal land initiatives. Advanced imaging and analytics improve yields, reduce chemical inputs, and safeguard ecosystems.",
    primary_naics: "541712", // Research and Development in the Physical, Engineering, and Life Sciences
    other_naics: ["336411", "541511"],
    set_asides: ["SB"],
    employee_count: 75,
    annual_revenue: 9_500_000
  },
  {
    name: "Pathrender Logistics",
    description: "Pathrender Logistics provides cold-chain transport, rapid resupply, and reverse logistics solutions for federal missions. Capabilities extend across medical supply distribution, rations delivery, and emergency equipment transport in disaster and deployment scenarios. Agile supply chain practices and proven reliability ensure secure, on-time arrival of mission-critical resources.",
    primary_naics: "488510", // Freight Transportation Arrangement
    other_naics: ["493120", "541614"],
    set_asides: ["SB", "8a"],
    employee_count: 220,
    annual_revenue: 32_000_000
  }
];

async function seed(db: PGDatabase = drizzleDB()) {
  console.log('🌱 Starting database seed...');

  const companies: NewCompany[] = await Promise.all(
    mockCompanies.map(async (co, idx) => {
      const embedding = await generateEmbedding(co.description);
      return {
        name: co.name,
        description: co.description,
        primary_naics: co.primary_naics,
        other_naics: co.other_naics,
        uei: `MOCK-${idx}`,
        set_asides: co.set_asides,
        employee_count: co.employee_count,
        annual_revenue: co.annual_revenue,
        embedding,
      };
    })
  );

  const inserts = await db.transaction(async tx => {
    return tx
      .insert(tables.companies)
      .values(companies)
      .onConflictDoNothing({ target: tables.companies.uei })
      .returning({ id: tables.companies.id, name: tables.companies.name });
  });

  console.log(`✔ Seeded ${inserts.length} companies`);
}

async function main() {
  try {
    await seed();
    console.log('Seeding complete.');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

main();
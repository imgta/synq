export interface MockSAMOpportunity {
  noticeId: string;
  title: string;
  solicitationNumber: string;
  fullParentPathName: string;
  fullParentPathCode: string;
  postedDate: string;
  type: string;
  baseType: string;
  archiveType: string;
  archiveDate: string;
  typeOfSetAsideDescription: string | null;
  typeOfSetAside: string | null;
  responseDeadLine: string | null;
  naicsCode: string;
  naicsCodes: string[];
  classificationCode: string;
  active: string;
  award: {
    number?: string;
    amount?: number;
    date?: string;
    awardee?: {
      name?: string;
      uei_sam?: string;
    };
  } | null;
  pointOfContact: Array<{
    type: string;
    email: string;
    phone: string;
    title: string | null;
    fullName: string;
  }>;
  description: string;
  organizationType: string;
  officeAddress: {
    zipcode: string;
    city: string;
    countryCode: string;
    state: string;
  };
  placeOfPerformance: {
    city?: { code?: string; name?: string; };
    state?: { code?: string; name?: string; };
    zip?: string;
    country?: { code?: string; name?: string; };
  };
  uiLink: string;
  resourceLinks: string[] | null;
}

export const mockOpportunities: MockSAMOpportunity[] = [
  {
    noticeId: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6",
    title: "Autonomous UAV Fleet Management System Development",
    solicitationNumber: "FA8650-26-R-5001",
    fullParentPathName: "DEPT OF DEFENSE.DEPT OF THE AIR FORCE.AIR FORCE MATERIEL COMMAND.AIR FORCE RESEARCH LABORATORY",
    fullParentPathCode: "057.5700.AFMC.AFRL",
    postedDate: "2025-09-28",
    type: "Solicitation",
    baseType: "Solicitation",
    archiveType: "auto15",
    archiveDate: "2025-11-12",
    typeOfSetAsideDescription: "Total Small Business Set-Aside (FAR 19.5)",
    typeOfSetAside: "SBA",
    responseDeadLine: "2025-10-28T14:00:00-04:00",
    naicsCode: "541712",
    naicsCodes: ["541712", "336411", "541511"],
    classificationCode: "R425",
    active: "Yes",
    award: null,
    pointOfContact: [
      {
        type: "primary",
        email: "contracting.officer@us.af.mil",
        phone: "937-255-3636",
        title: "Contract Specialist",
        fullName: "Sarah Mitchell"
      }
    ],
    description: "The Air Force Research Laboratory seeks advanced autonomous fleet management systems for unmanned aerial vehicles (UAVs). The system must provide real-time telemetry monitoring, predictive maintenance analytics, anomaly detection, and mission planning capabilities. Solution must integrate with existing DoD networks and support multi-platform UAV operations. Required capabilities include AI-driven risk assessment, automated fault detection, secure data transmission (AES-256), and compliance with NIST 800-171. Period of performance: 36 months base with two 12-month options.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "45433",
      city: "WRIGHT-PATTERSON AFB",
      countryCode: "USA",
      state: "OH"
    },
    placeOfPerformance: {
      city: { code: "88000", name: "Wright-Patterson AFB" },
      state: { code: "OH", name: "Ohio" },
      zip: "45433",
      country: { code: "USA", name: "UNITED STATES" }
    },
    uiLink: "https://sam.gov/opp/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6/view",
    resourceLinks: [
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/rfp-attachment-001.pdf",
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/sow-statement-002.pdf"
    ]
  },
  {
    noticeId: "q2w3e4r5t6y7u8i9o0p1a2s3d4f5g6h7",
    title: "PFAS Remediation Services for Military Installation Groundwater",
    solicitationNumber: "W912DY-26-R-0023",
    fullParentPathName: "DEPT OF DEFENSE.DEPT OF THE ARMY.US ARMY CORPS OF ENGINEERS.USACE HUNTSVILLE",
    fullParentPathCode: "017.2100.USACE.W912DY",
    postedDate: "2025-09-27",
    type: "Sources Sought",
    baseType: "Sources Sought",
    archiveType: "auto15",
    archiveDate: "2025-10-27",
    typeOfSetAsideDescription: "8(a) Set-Aside",
    typeOfSetAside: "8a",
    responseDeadLine: "2025-10-11T16:00:00-05:00",
    naicsCode: "562910",
    naicsCodes: ["562910", "541620", "541380"],
    classificationCode: "F099",
    active: "Yes",
    award: null,
    pointOfContact: [
      {
        type: "primary",
        email: "james.rodriguez@usace.army.mil",
        phone: "256-895-1234",
        title: "Contracting Officer",
        fullName: "James Rodriguez"
      }
    ],
    description: "U.S. Army Corps of Engineers seeks qualified 8(a) firms to provide comprehensive PFAS (Per- and Polyfluoroalkyl Substances) remediation services at Fort Campbell, Kentucky. Project scope includes site assessment, groundwater sampling, treatment system design and installation, and long-term monitoring. Contractor must demonstrate experience with advanced filtration technologies, ion exchange systems, or activated carbon treatment. Must comply with EPA regulations and state environmental standards. Estimated contract value $8-15M over 5 years. Site visit scheduled for October 15, 2025.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "35807",
      city: "HUNTSVILLE",
      countryCode: "USA",
      state: "AL"
    },
    placeOfPerformance: {
      city: { code: "28460", name: "Fort Campbell" },
      state: { code: "KY", name: "Kentucky" },
      zip: "42223",
      country: { code: "USA", name: "UNITED STATES" }
    },
    uiLink: "https://sam.gov/opp/q2w3e4r5t6y7u8i9o0p1a2s3d4f5g6h7/view",
    resourceLinks: [
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/site-info-001.pdf"
    ]
  },
  {
    noticeId: "z9x8c7v6b5n4m3l2k1j0h9g8f7d6s5a4",
    title: "Military Working Dog Telemedicine Platform",
    solicitationNumber: "N68836-26-R-0156",
    fullParentPathName: "DEPT OF DEFENSE.DEPT OF THE NAVY.NAVSUP.NAVSUP FLC NORFOLK",
    fullParentPathCode: "017.1700.NAVSUP.N68836",
    postedDate: "2025-09-26",
    type: "Combined Synopsis/Solicitation",
    baseType: "Combined Synopsis/Solicitation",
    archiveType: "auto15",
    archiveDate: "2025-10-26",
    typeOfSetAsideDescription: "Service-Disabled Veteran-Owned Small Business Set Aside",
    typeOfSetAside: "SDVOSBC",
    responseDeadLine: "2025-10-10T13:00:00-04:00",
    naicsCode: "541511",
    naicsCodes: ["541511", "621910", "541512"],
    classificationCode: "DA10",
    active: "Yes",
    award: null,
    pointOfContact: [
      {
        type: "primary",
        email: "veterinary.contracting@navy.mil",
        phone: "757-443-2100",
        title: "Contract Specialist",
        fullName: "Michael Thompson"
      }
    ],
    description: "Naval Supply Systems Command requires a secure telemedicine platform for military working dogs across CONUS and OCONUS installations. Platform must enable real-time video consultations between on-site veterinary technicians and remote veterinarians, maintain HIPAA-compliant digital medical records, support e-prescribing capabilities, and provide mobile application access. System must integrate with existing DoD networks, support bandwidth-limited environments, and meet FISMA Moderate security controls. Training and 24/7 technical support required. 5-year IDIQ contract with $500K minimum guarantee.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "23511",
      city: "NORFOLK",
      countryCode: "USA",
      state: "VA"
    },
    placeOfPerformance: {
      city: { code: "56000", name: "Norfolk" },
      state: { code: "VA", name: "Virginia" },
      zip: "23511",
      country: { code: "USA", name: "UNITED STATES" }
    },
    uiLink: "https://sam.gov/opp/z9x8c7v6b5n4m3l2k1j0h9g8f7d6s5a4/view",
    resourceLinks: [
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/rfq-statement.pdf",
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/technical-specs.pdf"
    ]
  },
  {
    noticeId: "p0o9i8u7y6t5r4e3w2q1a0s9d8f7g6h5",
    title: "Automated FOIA Document Review and Redaction System",
    solicitationNumber: "DOJ-CIV-26-R-0089",
    fullParentPathName: "JUSTICE, DEPARTMENT OF.CIVIL DIVISION.OFFICE OF ACQUISITION MANAGEMENT",
    fullParentPathCode: "015.1505.15C001",
    postedDate: "2025-09-25",
    type: "Presolicitation",
    baseType: "Presolicitation",
    archiveType: "autocustom",
    archiveDate: "2025-11-25",
    typeOfSetAsideDescription: "Total Small Business Set-Aside (FAR 19.5)",
    typeOfSetAside: "SBA",
    responseDeadLine: "2025-10-09T17:00:00-04:00",
    naicsCode: "541511",
    naicsCodes: ["541511", "541512", "541519"],
    classificationCode: "DA01",
    active: "Yes",
    award: null,
    pointOfContact: [
      {
        type: "primary",
        email: "acquisition@usdoj.gov",
        phone: "202-514-3000",
        title: "Contracting Officer",
        fullName: "Patricia Williams"
      }
    ],
    description: "Department of Justice Civil Division seeks AI-powered document review and redaction system for FOIA request processing. System must automatically identify and redact PII, classified information, attorney-client privileged content, and law enforcement sensitive data across PDF, Word, Excel, email (PST/OST), and scanned documents. Required features: natural language processing, machine learning accuracy >95%, audit trails, multi-user workflow management, integration with existing document management systems. Must meet FedRAMP Moderate authorization. Initial 1-year base period with four 1-year options. Estimated volume: 500,000+ pages annually.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "20530",
      city: "WASHINGTON",
      countryCode: "USA",
      state: "DC"
    },
    placeOfPerformance: {
      city: { code: "50000", name: "Washington" },
      state: { code: "DC", name: "District of Columbia" },
      zip: "20530",
      country: { code: "USA", name: "UNITED STATES" }
    },
    uiLink: "https://sam.gov/opp/p0o9i8u7y6t5r4e3w2q1a0s9d8f7g6h5/view",
    resourceLinks: null
  },
  {
    noticeId: "m1n2b3v4c5x6z7a8s9d0f1g2h3j4k5l6",
    title: "Immersive VR Training for TSA Security Checkpoint Operations",
    solicitationNumber: "HSTS03-26-R-TSA001",
    fullParentPathName: "HOMELAND SECURITY, DEPARTMENT OF.TRANSPORTATION SECURITY ADMINISTRATION.TSA ACQUISITION",
    fullParentPathCode: "070.7012.HSTS03",
    postedDate: "2025-09-24",
    type: "Sources Sought",
    baseType: "Sources Sought",
    archiveType: "auto15",
    archiveDate: "2025-10-24",
    typeOfSetAsideDescription: "Women-Owned Small Business Set-Aside",
    typeOfSetAside: "WOSB",
    responseDeadLine: "2025-10-08T15:00:00-04:00",
    naicsCode: "541511",
    naicsCodes: ["541511", "611430", "541512"],
    classificationCode: "R499",
    active: "Yes",
    award: null,
    pointOfContact: [
      {
        type: "primary",
        email: "tsa.acquisition@tsa.dhs.gov",
        phone: "571-227-2000",
        title: "Contract Specialist",
        fullName: "Jennifer Martinez"
      }
    ],
    description: "Transportation Security Administration seeks VR/AR-based training solutions for security checkpoint operations. Training modules must simulate: passenger screening procedures, prohibited item detection, de-escalation techniques, active threat response, and equipment operation. System must support multi-user scenarios, track individual performance metrics, integrate with TSA Learning Management System, and deploy across 450+ airports. Required features: realistic physics simulation, haptic feedback support, scenario randomization, after-action review capabilities, and accessibility compliance (Section 508). Hardware provisioning not required. Interested firms must demonstrate prior federal training development experience.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "20598",
      city: "ARLINGTON",
      countryCode: "USA",
      state: "VA"
    },
    placeOfPerformance: {
      city: { code: "04000", name: "Arlington" },
      state: { code: "VA", name: "Virginia" },
      zip: "20598",
      country: { code: "USA", name: "UNITED STATES" }
    },
    uiLink: "https://sam.gov/opp/m1n2b3v4c5x6z7a8s9d0f1g2h3j4k5l6/view",
    resourceLinks: [
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/training-requirements.pdf"
    ]
  },
  {
    noticeId: "q7w8e9r0t1y2u3i4o5p6a7s8d9f0g1h2",
    title: "Sustainable Packaging for Military Rations and Field Supplies",
    solicitationNumber: "SPE300-26-R-0445",
    fullParentPathName: "DEPT OF DEFENSE.DEFENSE LOGISTICS AGENCY.DLA TROOP SUPPORT.DLA TROOP SUPPORT PHILADELPHIA",
    fullParentPathCode: "097.97AS.DLA TROOP.SPE300",
    postedDate: "2025-09-23",
    type: "Solicitation",
    baseType: "Solicitation",
    archiveType: "auto15",
    archiveDate: "2025-11-07",
    typeOfSetAsideDescription: "8(a) Set-Aside",
    typeOfSetAside: "8a",
    responseDeadLine: "2025-10-23T12:00:00-04:00",
    naicsCode: "326111",
    naicsCodes: ["326111", "325211"],
    classificationCode: "8105",
    active: "Yes",
    award: null,
    pointOfContact: [
      {
        type: "primary",
        email: "subsistence.contracting@dla.mil",
        phone: "215-737-2000",
        title: "Contracting Officer",
        fullName: "Robert Chen"
      }
    ],
    description: "Defense Logistics Agency seeks biodegradable and compostable packaging solutions to replace single-use plastics in MREs (Meals Ready-to-Eat) and field logistics kits. Materials must meet military durability standards: temperature range -40°F to 140°F, drop test from 4 feet, 30-day field storage, moisture barrier properties, and FDA food contact compliance. Packaging must degrade within 180 days in industrial composting facilities per ASTM D6400. Initial requirement: 5 million units annually with potential for 20M+ unit expansion. Manufacturing must occur in USA or qualifying country. ISO 9001 and defense contract experience required. Prototype submission and testing required during evaluation phase.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "19101",
      city: "PHILADELPHIA",
      countryCode: "USA",
      state: "PA"
    },
    placeOfPerformance: {
      city: { code: "60000", name: "Philadelphia" },
      state: { code: "PA", name: "Pennsylvania" },
      zip: "19101",
      country: { code: "USA", name: "UNITED STATES" }
    },
    uiLink: "https://sam.gov/opp/q7w8e9r0t1y2u3i4o5p6a7s8d9f0g1h2/view",
    resourceLinks: [
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/packaging-specs.pdf",
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/testing-requirements.pdf",
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/mil-std-references.pdf"
    ]
  },
  {
    noticeId: "z3x4c5v6b7n8m9k0l1j2h3g4f5d6s7a8",
    title: "Biomanufacturing Process Optimization and Scale-Up Analysis",
    solicitationNumber: "DARPA-PA-26-01-FP25",
    fullParentPathName: "DEPT OF DEFENSE.DEFENSE ADVANCED RESEARCH PROJECTS AGENCY.DARPA BTO",
    fullParentPathCode: "097.97AD.DARPABTO",
    postedDate: "2025-09-22",
    type: "Presolicitation",
    baseType: "Presolicitation",
    archiveType: "autocustom",
    archiveDate: "2025-12-22",
    typeOfSetAsideDescription: null,
    typeOfSetAside: null,
    responseDeadLine: "2025-11-06T17:00:00-05:00",
    naicsCode: "541712",
    naicsCodes: ["541712", "541618"],
    classificationCode: "R425",
    active: "Yes",
    award: null,
    pointOfContact: [
      {
        type: "primary",
        email: "bto.contracting@darpa.mil",
        phone: "703-526-6630",
        title: "Program Manager",
        fullName: "Dr. Elizabeth Foster"
      }
    ],
    description: "DARPA Biological Technologies Office seeks techno-economic analysis and process engineering expertise for biomanufacturing scale-up initiatives. Project involves evaluating synthetic biology pathways, alternative feedstock options, enzyme kinetics, and fermentation conditions to identify optimization opportunities. Deliverables include: process flow diagrams, mass/energy balances, cost models ($0.50/kg target), bottleneck analysis, and commercialization roadmaps. Required expertise: bioprocess engineering, metabolic engineering, industrial microbiology, and economic modeling. Security clearance not required for Phase I. 18-month base period with 12-month option. Estimated award: $1.2-2.5M. White papers due by October 20, 2025.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "22203",
      city: "ARLINGTON",
      countryCode: "USA",
      state: "VA"
    },
    placeOfPerformance: {
      city: { code: "04000", name: "Arlington" },
      state: { code: "VA", name: "Virginia" },
      zip: "22203",
      country: { code: "USA", name: "UNITED STATES" }
    },
    uiLink: "https://sam.gov/opp/z3x4c5v6b7n8m9k0l1j2h3g4f5d6s7a8/view",
    resourceLinks: [
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/baa-announcement.pdf",
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/white-paper-instructions.pdf"
    ]
  },
  {
    noticeId: "a9s8d7f6g5h4j3k2l1z0x9c8v7b6n5m4",
    title: "Managed Cybersecurity Services for Defense Industrial Base",
    solicitationNumber: "HC1019-26-R-0078",
    fullParentPathName: "DEPT OF DEFENSE.DEFENSE INFORMATION SYSTEMS AGENCY.DISA FIELD SECURITY OPERATIONS",
    fullParentPathCode: "097.97AK.HC1019",
    postedDate: "2025-09-21",
    type: "Solicitation",
    baseType: "Solicitation",
    archiveType: "auto15",
    archiveDate: "2025-11-05",
    typeOfSetAsideDescription: "Service-Disabled Veteran-Owned Small Business Set Aside",
    typeOfSetAside: "SDVOSBC",
    responseDeadLine: "2025-10-21T15:00:00-04:00",
    naicsCode: "541512",
    naicsCodes: ["541512", "541513", "541519"],
    classificationCode: "DA01",
    active: "Yes",
    award: null,
    pointOfContact: [
      {
        type: "primary",
        email: "disa.contracts@mail.mil",
        phone: "301-225-6000",
        title: "Contracting Officer",
        fullName: "David Harrison"
      }
    ],
    description: "Defense Information Systems Agency requires comprehensive managed cybersecurity services for Defense Industrial Base (DIB) contractors. Services include: 24/7 security operations center (SOC) monitoring, threat intelligence analysis, incident response, vulnerability assessments, penetration testing, security awareness training, and CMMC compliance support. Must support NIST SP 800-171, DFARS 252.204-7012, and CMMC Level 2 requirements. Personnel must maintain Secret clearance and Security+ certification minimum. Required capabilities: SIEM platform management, EDR/XDR tools, threat hunting, forensics, and malware analysis. 5-year IDIQ contract, $50M ceiling, multiple awards anticipated. Past performance in DoD environment required.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "20755",
      city: "FORT MEADE",
      countryCode: "USA",
      state: "MD"
    },
    placeOfPerformance: {
      city: { code: "30325", name: "Fort Meade" },
      state: { code: "MD", name: "Maryland" },
      zip: "20755",
      country: { code: "USA", name: "UNITED STATES" }
    },
    uiLink: "https://sam.gov/opp/a9s8d7f6g5h4j3k2l1z0x9c8v7b6n5m4/view",
    resourceLinks: [
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/rfp-full.pdf",
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/cmmc-requirements.pdf",
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/security-matrix.pdf"
    ]
  },
  {
    noticeId: "p1o2i3u4y5t6r7e8w9q0a1s2d3f4g5h6",
    title: "Precision Agriculture Analytics for USDA Conservation Programs",
    solicitationNumber: "12FPC-26-R-0034",
    fullParentPathName: "AGRICULTURE, DEPARTMENT OF.FARM PRODUCTION AND CONSERVATION.NATURAL RESOURCES CONSERVATION SERVICE",
    fullParentPathCode: "005.0508.12FPC0",
    postedDate: "2025-09-20",
    type: "Combined Synopsis/Solicitation",
    baseType: "Combined Synopsis/Solicitation",
    archiveType: "auto15",
    archiveDate: "2025-10-20",
    typeOfSetAsideDescription: "Total Small Business Set-Aside (FAR 19.5)",
    typeOfSetAside: "SBA",
    responseDeadLine: "2025-10-04T16:00:00-04:00",
    naicsCode: "541712",
    naicsCodes: ["541712", "336411", "541511"],
    classificationCode: "R425",
    active: "Yes",
    award: null,
    pointOfContact: [
      {
        type: "primary",
        email: "nrcs.contracting@usda.gov",
        phone: "202-720-3210",
        title: "Contract Specialist",
        fullName: "Amanda Richardson"
      }
    ],
    description: "Natural Resources Conservation Service seeks drone-based multispectral imaging and AI analytics platform for precision agriculture monitoring across conservation programs. System must provide: crop health assessment using NDVI/NDRE indices, soil moisture analysis, erosion detection, cover crop verification, and water quality monitoring. Platform must process imagery from fixed-wing and multirotor UAVs, generate automated reports, integrate with USDA geospatial databases, and support offline operation in rural areas. Required outputs: prescription maps, yield predictions, conservation practice effectiveness metrics. Must support 500+ field staff across all 50 states. Training, technical support, and annual software updates included. 3-year base with two 1-year options.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "20250",
      city: "WASHINGTON",
      countryCode: "USA",
      state: "DC"
    },
    placeOfPerformance: {
      city: { code: "50000", name: "Washington" },
      state: { code: "DC", name: "District of Columbia" },
      zip: "20250",
      country: { code: "USA", name: "UNITED STATES" }
    },
    uiLink: "https://sam.gov/opp/p1o2i3u4y5t6r7e8w9q0a1s2d3f4g5h6/view",
    resourceLinks: [
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/technical-requirements.pdf"
    ]
  },
  {
    noticeId: "z1x2c3v4b5n6m7k8l9j0h1g2f3d4s5a6",
    title: "Cold Chain Logistics for Emergency Medical Supply Distribution",
    solicitationNumber: "HHSO100-26-R-00012",
    fullParentPathName: "HEALTH AND HUMAN SERVICES, DEPARTMENT OF.OFFICE OF THE SECRETARY.ASPR OFFICE OF ACQUISITION MANAGEMENT",
    fullParentPathCode: "075.7501.HHSO10",
    postedDate: "2025-09-19",
    type: "Sources Sought",
    baseType: "Sources Sought",
    archiveType: "autocustom",
    archiveDate: "2025-11-19",
    typeOfSetAsideDescription: "8(a) Set-Aside",
    typeOfSetAside: "8a",
    responseDeadLine: "2025-10-03T17:00:00-04:00",
    naicsCode: "488510",
    naicsCodes: ["488510", "493120", "541614"],
    classificationCode: "V199",
    active: "Yes",
    award: null,
    pointOfContact: [
      {
        type: "primary",
        email: "aspr.contracting@hhs.gov",
        phone: "202-205-9559",
        title: "Contracting Officer",
        fullName: "Laura Bennett"
      }
    ],
    description: "HHS Office of the Assistant Secretary for Preparedness and Response seeks cold chain logistics services for Strategic National Stockpile emergency medical supply distribution. Services include: temperature-controlled transportation (2-8°C and -20°C), real-time GPS tracking, 24/7 dispatch coordination, last-mile delivery to Points of Dispensing (PODs), reverse logistics for expired products, and emergency response within 4 hours. Must maintain FDA-compliant cold chain validation, backup power systems, redundant refrigeration, and continuous temperature monitoring with data logging. Required capabilities: nationwide coverage, surge capacity for pandemic response (500+ simultaneous deliveries), and integration with HHS tracking systems. Security clearance not required. Estimated contract value: $25-40M over 5 years with indefinite delivery.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "20201",
      city: "WASHINGTON",
      countryCode: "USA",
      state: "DC"
    },
    placeOfPerformance: {
      city: { code: "50000", name: "Washington" },
      state: { code: "DC", name: "District of Columbia" },
      zip: "20201",
      country: { code: "USA", name: "UNITED STATES" }
    },
    uiLink: "https://sam.gov/opp/z1x2c3v4b5n6m7k8l9j0h1g2f3d4s5a6/view",
    resourceLinks: [
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/logistics-requirements.pdf",
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/cold-chain-specs.pdf"
    ]
  },
  {
    noticeId: "h7j8k9l0z1x2c3v4b5n6m7a8s9d0f1g2",
    title: "Enterprise IT Infrastructure Modernization for VA Healthcare Systems",
    solicitationNumber: "36C10B26R0089",
    fullParentPathName: "VETERANS AFFAIRS, DEPARTMENT OF.VETERANS AFFAIRS, DEPARTMENT OF.TECHNOLOGY ACQUISITION CENTER NJ (36C10B)",
    fullParentPathCode: "036.3600.36C10B",
    postedDate: "2025-09-18",
    type: "Presolicitation",
    baseType: "Presolicitation",
    archiveType: "autocustom",
    archiveDate: "2025-12-18",
    typeOfSetAsideDescription: null,
    typeOfSetAside: null,
    responseDeadLine: "2025-11-02T14:00:00-04:00",
    naicsCode: "541512",
    naicsCodes: ["541512", "541513"],
    classificationCode: "DA01",
    active: "Yes",
    award: null,
    pointOfContact: [
      {
        type: "primary",
        email: "va.contracting@va.gov",
        phone: "848-377-5100",
        title: "Contract Specialist",
        fullName: "Thomas Anderson"
      }
    ],
    description: "Department of Veterans Affairs seeks comprehensive IT infrastructure modernization services across 170+ VA medical centers and 1,000+ outpatient clinics. Scope includes: cloud migration strategy and implementation (AWS GovCloud/Azure Government), network infrastructure upgrades, cybersecurity hardening, system integration, data center consolidation, and legacy application modernization. Must support Electronic Health Record Modernization (EHRM) initiative integration with Cerner Millennium platform. Required certifications: FedRAMP High, HITRUST, ISO 27001. Personnel must maintain active security clearances and specialized VA system knowledge. This is a 10-year IDIQ contract with $2B ceiling, multiple awards anticipated. Contractor teaming arrangements encouraged.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "07724",
      city: "EATONTOWN",
      countryCode: "USA",
      state: "NJ"
    },
    placeOfPerformance: {
      city: { code: "25300", name: "Eatontown" },
      state: { code: "NJ", name: "New Jersey" },
      zip: "07724",
      country: { code: "USA", name: "UNITED STATES" }
    },
    uiLink: "https://sam.gov/opp/h7j8k9l0z1x2c3v4b5n6m7a8s9d0f1g2/view",
    resourceLinks: [
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/draft-rfp.pdf",
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/architecture-overview.pdf",
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/security-requirements.pdf"
    ]
  },
  {
    noticeId: "t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9z0",
    title: "AI-Powered Threat Detection System for Border Security",
    solicitationNumber: "70CDCR26R00000009",
    fullParentPathName: "HOMELAND SECURITY, DEPARTMENT OF.CUSTOMS AND BORDER PROTECTION.CBP OFFICE OF ACQUISITION",
    fullParentPathCode: "070.7001.70CDCR",
    postedDate: "2025-09-17",
    type: "Sources Sought",
    baseType: "Sources Sought",
    archiveType: "auto15",
    archiveDate: "2025-10-17",
    typeOfSetAsideDescription: null,
    typeOfSetAside: null,
    responseDeadLine: "2025-10-01T16:00:00-04:00",
    naicsCode: "541512",
    naicsCodes: ["541512", "541511"],
    classificationCode: "R425",
    active: "Yes",
    award: null,
    pointOfContact: [
      {
        type: "primary",
        email: "cbp.acquisition@cbp.dhs.gov",
        phone: "703-603-3200",
        title: "Program Manager",
        fullName: "Carlos Ramirez"
      }
    ],
    description: "U.S. Customs and Border Protection seeks AI-powered threat detection and analysis system for border security operations. System must integrate multiple data sources: biometric databases, license plate recognition, cargo manifest data, intelligence feeds, and sensor networks. Required capabilities: real-time risk scoring, anomaly detection, predictive analytics, facial recognition (NIST FRVT Top 10), automated alerts, and case management workflow. Must process 1M+ border crossings daily with <100ms latency. Integration required with: TECS (Treasury Enforcement Communications System), IDENT biometric database, and CBPOne mobile application. System must meet CJIS Security Policy and FedRAMP High standards. Interested parties must demonstrate prior DHS/law enforcement system development experience and AI/ML expertise in high-throughput environments.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "20229",
      city: "WASHINGTON",
      countryCode: "USA",
      state: "DC"
    },
    placeOfPerformance: {
      city: { code: "50000", name: "Washington" },
      state: { code: "DC", name: "District of Columbia" },
      zip: "20229",
      country: { code: "USA", name: "UNITED STATES" }
    },
    uiLink: "https://sam.gov/opp/t5y6u7i8o9p0a1s2d3f4g5h6j7k8l9z0/view",
    resourceLinks: null
  },
  {
    noticeId: "w3e4r5t6y7u8i9o0p1q2a3s4d5f6g7h8",
    title: "Satellite Data Processing and Analytics Platform",
    solicitationNumber: "NNG26HA01C",
    fullParentPathName: "NATIONAL AERONAUTICS AND SPACE ADMINISTRATION.NASA HEADQUARTERS.NASA HQ PROCUREMENT OFFICE",
    fullParentPathCode: "080.8000.NNG000",
    postedDate: "2025-09-16",
    type: "Solicitation",
    baseType: "Solicitation",
    archiveType: "auto15",
    archiveDate: "2025-10-31",
    typeOfSetAsideDescription: "Total Small Business Set-Aside (FAR 19.5)",
    typeOfSetAside: "SBA",
    responseDeadLine: "2025-10-16T17:00:00-04:00",
    naicsCode: "541712",
    naicsCodes: ["541712", "541511"],
    classificationCode: "R425",
    active: "Yes",
    award: null,
    pointOfContact: [
      {
        type: "primary",
        email: "nasa-procurement@nasa.gov",
        phone: "202-358-1000",
        title: "Contracting Officer",
        fullName: "Katherine Lee"
      }
    ],
    description: "NASA Earth Science Division seeks advanced satellite data processing platform for climate and environmental monitoring missions. System must ingest, process, and distribute petabyte-scale datasets from Landsat, MODIS, VIIRS, and upcoming PACE mission. Required capabilities: automated Level 0 to Level 2 processing pipelines, cloud-optimized data formats (COG, Zarr), RESTful API access, machine learning model deployment for classification tasks, and visualization tools. Platform must support: time-series analysis, multi-sensor data fusion, change detection algorithms, and public data access via NASA Earthdata portal. Infrastructure must be cloud-native (AWS preferred), scalable to 500TB monthly ingestion, and achieve 99.9% uptime SLA. Open-source contributions encouraged. 5-year contract with estimated value $15-25M.",
    organizationType: "OFFICE",
    officeAddress: {
      zipcode: "20546",
      city: "WASHINGTON",
      countryCode: "USA",
      state: "DC"
    },
    placeOfPerformance: {
      city: { code: "50000", name: "Washington" },
      state: { code: "DC", name: "District of Columbia" },
      zip: "20546",
      country: { code: "USA", name: "UNITED STATES" }
    },
    uiLink: "https://sam.gov/opp/w3e4r5t6y7u8i9o0p1q2a3s4d5f6g7h8/view",
    resourceLinks: [
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/technical-proposal-instructions.pdf",
      "https://sam.gov/api/prod/opps/v3/opportunities/resources/files/data-specifications.pdf"
    ]
  }
];


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
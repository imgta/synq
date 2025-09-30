export const MOCK_PROGRAMS = [
  {
    code: 'GOLDEN-DOME', // Layered Defense
    name: 'Golden Dome Integrated Air and Missile Defense',
    description: 'Multi-layered air and missile defense system integrating advanced radar networks, AI-powered threat classification, interceptor coordination, and battle management command and control. Protects critical infrastructure and forward-deployed forces from hypersonic missiles, cruise missiles, UAS swarms, and ballistic threats. Leverages machine learning for real-time threat assessment and autonomous engagement sequencing.',
    estimated_value: 18_500_000_000,
    key_naics: ['541512', '541511', '334220', '541712', '336414'],
    prime_contractors: ['Lockheed Martin', 'Raytheon Technologies', 'Northrop Grumman'],
  },
  {
    code: 'JADC2',
    name: 'Joint All-Domain Command and Control',
    description: 'Cloud-native data fabric enabling sensor-to-shooter connectivity across all military services and warfighting domains (air, land, sea, space, cyber). Real-time data fusion from 100,000+ endpoints, zero-trust architecture, AI-driven decision support, and edge computing for contested environments. Requires FedRAMP High authorization and DevSecOps at scale.',
    estimated_value: 12_000_000_000,
    key_naics: ['541512', '541511', '541513', '518210'],
    prime_contractors: ['General Dynamics IT', 'L3Harris', 'CACI', 'Leidos'],
  },
  {
    code: 'STE', // Training Ecosystem
    name: 'Synthetic Training Environment',
    description: 'Immersive virtual training ecosystem leveraging cloud infrastructure, game engines, geospatial intelligence, and physics-based simulation. Creates realistic training scenarios for squad-level tactics to joint combined arms operations. Includes VR/AR interfaces, AI-driven opposing forces, after-action review analytics, and integration with live training instrumentation.',
    estimated_value: 8_700_000_000,
    key_naics: ['541511', '611430', '541512', '541370'],
    prime_contractors: ['Bohemia Interactive Simulations', 'SAIC', 'Parsons'],
  },
  {
    code: 'MHS-GENESIS',
    name: 'Military Health System GENESIS',
    description: 'Enterprise electronic health record (EHR) system deployed across 700+ military treatment facilities worldwide. Integrates clinical workflows, pharmacy, laboratory, radiology, telehealth, and remote patient monitoring. Requires HIPAA/FISMA compliance, Oracle Cerner EHR integration, medical device interoperability, and secure mobile access for deployed personnel.',
    estimated_value: 9_100_000_000,
    key_naics: ['541512', '541511', '334510', '621999'],
    prime_contractors: ['Oracle Cerner', 'Leidos', 'Accenture Federal Services'],
  },
  {
    code: 'CBRN-MODERNIZATION', // Logistical Biosurveillance
    name: 'CBRN Defense Modernization Initiative',
    description: 'Next-generation chemical, biological, radiological, and nuclear defense systems. Autonomous detection sensors, rapid diagnostic platforms, biosurveillance data fusion, modeling and simulation for threat prediction, and medical countermeasure distribution logistics. Emphasis on standoff detection, low false-positive rates, and integration with joint warning networks.',
    estimated_value: 5_200_000_000,
    key_naics: ['541712', '339112', '541380', '488510'],
    prime_contractors: ['Battelle Memorial Institute', 'Amentum', 'CSRA'],
  },
];

export const MOCK_COMPANIES = [
  // AI/ML SPECIALISTS FOR THREAT DETECTION - need primes
  {
    name: 'Contrail Analytics',
    description: 'Contrail Analytics develops flight data monitoring and anomaly detection systems for unmanned aerial vehicles (UAVs) and aerospace fleets. We integrate advanced telemetry analytics with predictive maintenance algorithms, enabling early identification of risks before they become failures. Our platforms enhance mission safety, extend aircraft lifespans, and support both defense and civilian aviation programs with reliable, realtime insights required of high-stakes airspace operations.',
    primary_naics: '541712',
    other_naics: ['336411', '541511', '541513'],
    uei: 'CNTRAIL85M',
    sba_certifications: [],
    employee_count: 85,
    annual_revenue: 12_000_000,
    certifications: ['ISO 9001:2015', 'CMMC Level 2', 'AS9100D'],
    past_performance: {
      rating: 4.5,
      notable_contracts: ['$8.2M USAF Predictive Maintenance', '$4.5M Navy UAV Fleet Analytics'],
    },
  },

  // ENVIRONMENTAL/REMEDIATION
  {
    name: 'Terra Sift',
    description: 'Terra Sift specializes in environmental cleanup for hazardous contaminants including PFAS and heavy metals. We deploy advanced bio-filtration and advanced sequestration chemistry that restore groundwater and soil across military bases, industrial sites, and public lands. Our expertise ensures strict regulatory compliance while aligning with long-term federal sustainability and mission-critical objectives.',
    primary_naics: '562910', // Remediation Services
    other_naics: ['541620', '541380'],
    uei: 'TERRASIFT120M',
    sba_certifications: ['8A'],
    employee_count: 120,
    annual_revenue: 18_500_000,
    certifications: ['ISO 14001:2015', 'USACE CQM'],
    past_performance: {
      rating: 4.7,
      notable_contracts: ['$14.2M Fort Bragg PFAS Remediation', '$9.8M Navy Installation Restoration'],
    },
  },

  // CLOUD/DEVOPS - 8(a) set-asides need mentors
  {
    name: 'CloudForge Federal',
    description: 'Cloud-native application development and DevSecOps for federal agencies. Builds containerized microservices, CI/CD pipelines, infrastructure-as-code, and Kubernetes orchestration. Expertise in AWS GovCloud, Azure Government, and multi-cloud architectures. Specializes in ATO acceleration, continuous monitoring, and zero-trust implementations for mission-critical systems.',
    primary_naics: '541511',
    other_naics: ['541512', '541519'],
    uei: 'CLOUDFORGE42M',
    sba_certifications: ['8A'],
    employee_count: 42,
    annual_revenue: 5_900_000,
    certifications: ['FedRAMP 3PAO Recognized', 'AWS Advanced Consulting Partner', 'CMMC Level 2'],
    past_performance: {
      rating: 4.3,
      notable_contracts: ['$4.8M VA Cloud Migration', '$2.9M DOT DevSecOps Pipeline'],
    },
  },

  // SYSTEMS INTEGRATORS - primes needing subs
  {
    name: 'Apex Integration Partners',
    description: 'Prime contractor specializing in large-scale systems integration for Department of Defense. Manages multi-vendor teams, agile software development at scale, and mission-critical system deployments. Cleared workforce of 650+ with expertise in program management, DevSecOps, cloud migration, enterprise architecture, and legacy modernization. Proven track record as prime on $100M+ contracts.',
    primary_naics: '541512',
    other_naics: ['541513', '541519'],
    uei: 'APEX650L',
    sba_certifications: [],
    employee_count: 650,
    annual_revenue: 185_000_000,
    certifications: ['CMMC Level 3', 'ISO 27001', 'FedRAMP High', 'ITIL v4'],
    past_performance: {
      rating: 4.6,
      notable_contracts: ['$142M Air Force IT Modernization', '$87M DIA Enterprise Services', '$65M Navy Cyber Defense'],
    },
  },

  // TELEHEALTH/MEDICAL IT
  {
    name: 'VetConnect Telehealth',
    description: 'VetConnect Telehealth delivers secure telemedicine solutions designed for working animals in federal service. Our secure telehealth platform enables military bases and rural agencies to access real-time veterinary care, including video diagnostics, digital records, and e-prescriptions. Integrated cybersecurity safeguards ensure the protection of sensitive data while supporting the health and performance of service animals.',
    primary_naics: '541511', // Custom Computer Programming Services
    other_naics: ['621910', '541512'],
    uei: 'VETCONN45M',
    sba_certifications: ['SDVOSB'],
    employee_count: 45,
    annual_revenue: 6_200_000,
    certifications: ['HIPAA', 'FISMA Moderate ATO', 'ISO 27001'],
    past_performance: {
      rating: 4.6,
      notable_contracts: ['$4.9M Navy Veterinary Telehealth', '$2.8M USDA Remote Consultation'],
    },
  },
  // DOCUMENT PROCESSING/AI
  {
    name: 'OnBlur Inc.',
    description: 'OnBlur Inc. provides AI-driven e-discovery and redaction services for federal agencies handling sensitive documents. Its platform automates the removal of personally identifiable information (PII) and classified content, streamlining FOIA responses, litigation workflows, and investigative reviews. Automated compliance features preserve information security and reduce the time and cost of large-scale document processing.',
    primary_naics: '541511', // Custom Computer Programming Services
    other_naics: ['541512', '541519'],
    uei: 'ONBLUR35M',
    sba_certifications: [],
    employee_count: 35,
    annual_revenue: 4_800_000,
    certifications: ['FedRAMP Moderate', 'ISO 27001'],
    past_performance: {
      rating: 4.4,
      notable_contracts: ['$3.6M DOJ FOIA Processing', '$2.1M DHS Document Review'],
    },
  },

  // VR/TRAINING
  {
    name: 'Tristimuli',
    description: 'Tristimuli creates VR and AR-based training environments that replicate real-world crisis scenarios. The company designs immersive modules that prepare first responders, TSA officers, and emergency managers in lifelike but controlled environments. Experiential learning combined with performance analytics improves readiness, reduces training costs, and strengthens response effectiveness.',
    primary_naics: '541511', // Custom Computer Programming Services
    other_naics: ['611430', '541512'],
    uei: 'TRISTI65M',
    sba_certifications: ['WOSB'],
    employee_count: 65,
    annual_revenue: 8_900_000,
    certifications: ['Section 508 Compliance', 'SCORM 2004'],
    past_performance: {
      rating: 4.5,
      notable_contracts: ['$6.8M TSA Checkpoint Training', '$4.2M FEMA Emergency Response VR'],
    },
  },

  // SUSTAINABLE PACKAGING
  {
    name: 'Stylefoam Solutions',
    description: 'Stylefoam Solutions manufactures biodegradable and compostable packaging engineered for durability in field operations. Products replace single-use plastics in MREs, logistics supply kits, and cafeteria services, reducing waste while maintaining reliability. Material science innovation and scalable production capabilities support compliance with federal sustainability mandates and long-term environmental objectives.',
    primary_naics: '326111', // Plastics Bag and Pouch Manufacturing
    other_naics: ['325211', '541712'],
    sba_certifications: ['8A'],
    employee_count: 150,
    annual_revenue: 22_000_000,
    certifications: ['ISO 9001:2015', 'FDA Food Contact', 'ASTM D6400'],
    past_performance: {
      rating: 4.3,
      notable_contracts: ['$16.5M DLA MRE Packaging', '$8.9M Navy Sustainable Materials'],
    },
  },

  // BIOMANUFACTURING R&D
  {
    name: 'Synonym Bio',
    description: 'Synonym Bio conducts techno-economic analysis to evaluate the scalability and cost efficiency of biomanufacturing processes. Modeling efforts assess emerging feedstocks, enzymes, and synthetic biology pathways, identifying bottlenecks and guiding resource allocation. Insights enable federal agencies and partners to evaluate commercialization pathways and transition from lab-scale to industrial-scale bioproduction.',
    primary_naics: '541712', // Research and Development in the Physical, Engineering, and Life Sciences
    other_naics: ['541618', '325414'],
    sba_certifications: [],
    employee_count: 25,
    annual_revenue: 3_200_000,
    certifications: ['ISO 17025', 'GLP Certified'],
    past_performance: {
      rating: 4.7,
      notable_contracts: ['$2.4M DARPA Biomanufacturing Scale-Up', '$1.8M DOE Process Optimization'],
    },
  },

  // CYBERSECURITY
  {
    name: 'ZeroDay Cybersecurity',
    description: 'ZeroDay Cybersecurity delivers comprehensive defensive and compliance-focused cybersecurity services. Capabilities include red teaming, penetration testing, incident response, and managed compliance aligned with frameworks such as FISMA and CMMC. Cleared experts combine technical depth with regulatory knowledge to maintain resilient, mission-critical systems across defense and intelligence environments.',
    primary_naics: '541512', // Computer Systems Design Services
    other_naics: ['541513', '541519'],
    uei: 'ZERODAY180M',
    sba_certifications: ['SDVOSB'],
    employee_count: 180,
    annual_revenue: 28_000_000,
    certifications: ['CMMC Level 3', 'ISO 27001', 'FedRAMP 3PAO'],
    past_performance: {
      rating: 4.8,
      notable_contracts: ['$19.2M DIB Cybersecurity Services', '$12.6M Air Force Managed Security'],
    },
  },

  // GEOSPATIAL INTELLIGENCE
  {
    name: 'Guardian Geospatial',
    description: 'Geospatial intelligence (GEOINT) and remote sensing analytics. Processes satellite imagery, LiDAR, hyperspectral data, and SAR for terrain analysis, change detection, and mission planning. Automated feature extraction using deep learning, 3D reconstruction, and temporal analysis. Supports NGA, service-level intelligence centers, and tactical planning cells.',
    primary_naics: '541712',
    other_naics: ['541370', '541990'],
    uei: 'GUARDIAN58M',
    sba_certifications: [],
    employee_count: 58,
    annual_revenue: 8_400_000,
    certifications: ['NGA GEOINT Accredited', 'ISO 9001:2015'],
    past_performance: {
      rating: 4.6,
      notable_contracts: ['$6.3M NGA Imagery Analytics', '$3.9M Army GEOINT Support'],
    },
  },

  // BIOSURVEILLANCE
  {
    name: 'BioShield Innovations',
    description: 'CBRN detection, biosurveillance, and medical countermeasures. Develops rapid diagnostic systems, environmental monitoring sensors, and data fusion platforms for biological threat detection. Technologies include PCR-based pathogen identification, aerosol samplers, and network-enabled early warning systems. Supports Joint Program Executive Office for CBRN Defense.',
    primary_naics: '541712',
    other_naics: ['339112', '541380'],
    uei: 'BIOSHIELD68M',
    sba_certifications: [],
    employee_count: 68,
    annual_revenue: 11_200_000,
    certifications: ['CLIA Certified', 'ISO 13485', 'CDC Select Agent'],
    past_performance: {
      rating: 4.8,
      notable_contracts: ['$8.4M JPEO-CBRND Biosurveillance', '$4.9M DHS BioWatch Support'],
    },
  },

  // SIMULATION ENGINES
  {
    name: 'Pulse Simulation Technologies',
    description: 'Physics-based simulation engines and synthetic environments. Creates high-fidelity models for weapons systems, vehicle dynamics, sensor phenomenology, and environmental effects. HLA/DIS compliant architectures enable interoperability with live training instrumentation. Real-time engines support hardware-in-the-loop testing and virtual prototyping for acquisition programs.',
    primary_naics: '541512',
    other_naics: ['541511', '611430'],
    uei: 'PULSE88M',
    sba_certifications: [],
    employee_count: 88,
    annual_revenue: 14_900_000,
    certifications: ['HLA Certified', 'ISO 9001:2015'],
    past_performance: {
      rating: 4.7,
      notable_contracts: ['$10.2M Navy Simulation Framework', '$6.8M Air Force Test & Evaluation'],
    },
  },

  // LOGISTICS
  {
    name: 'Pathrender Logistics',
    description: 'Pathrender Logistics provides cold-chain transport, rapid resupply, and reverse logistics solutions for federal missions. Capabilities extend across medical supply distribution, rations delivery, and emergency equipment transport in disaster and deployment scenarios. Agile supply chain practices and proven reliability ensure secure, on-time arrival of mission-critical resources.',
    primary_naics: '488510', // Freight Transportation Arrangement
    other_naics: ['493120', '541614'],
    uei: 'PATHRENDER220M',
    sba_certifications: ['8A'],
    employee_count: 220,
    annual_revenue: 32_000_000,
    certifications: ['ISO 9001:2015', 'TAPA FSR A', 'FDA Registered'],
    past_performance: {
      rating: 4.4,
      notable_contracts: ['$23.1M HHS Strategic National Stockpile', '$14.7M DLA Medical Distribution'],
    },
  },

  // CONSTRUCTION + HUBZONE
  {
    name: 'Ridgeline Builders',
    description: 'Military construction and facilities management specializing in secure communications facilities, hardened structures, and rapid base infrastructure deployment. SCIF construction expertise, blast-resistant design, and expeditionary construction capabilities for forward operating bases. HUBZone certified with operations in rural Appalachia providing economic opportunity to underserved communities.',
    primary_naics: '236220', // Commercial and Institutional Building Construction
    other_naics: ['238210', '541330'],
    uei: 'RIDGELINE180M',
    sba_certifications: ['HZ'],
    employee_count: 180,
    annual_revenue: 45_000_000,
    certifications: ['USACE CQM', 'OSHA 30-Hour', 'SCIF Accredited'],
    past_performance: {
      rating: 4.5,
      notable_contracts: ['$28.4M Fort Campbell SCIF Construction', '$19.7M Navy P-712 Facilities'],
    },
  },
  // RADAR/SENSOR MANUFACTURING + EDWOSB
  {
    name: 'Sentinel Microsystems',
    description: 'Design and manufacture of compact radar systems, RF transceivers, and sensor arrays for air defense and electronic warfare. GaN-based solid-state radar technology, AESA antenna modules, and software-defined radio platforms. Expertise in miniaturization for UAV integration and mobile platforms. Women-owned small business with focus on next-generation phased array systems.',
    primary_naics: '334220', // Radio and Television Broadcasting and Wireless Communications Equipment Manufacturing
    other_naics: ['334290', '541712'],
    uei: 'SENTINEL92M',
    sba_certifications: ['EDWOSB'],
    employee_count: 92,
    annual_revenue: 16_800_000,
    certifications: ['AS9100D', 'ISO 9001:2015', 'ITAR Registered'],
    past_performance: {
      rating: 4.6,
      notable_contracts: ['$11.3M Army Counter-UAS Radar', '$7.9M DARPA Miniaturized AESA'],
    },
  },

  // EMBEDDED SYSTEMS/FIRMWARE
  {
    name: 'Ironclad Embedded',
    description: 'Real-time embedded software and firmware for mission-critical defense systems. Safety-critical DO-178C development, secure boot implementations, FPGA programming, and bare-metal driver development. Specializes in sensor integration, signal processing pipelines, and fault-tolerant architectures for harsh environments. Supports ruggedized platforms from tactical radios to munitions guidance systems.',
    primary_naics: '541511', // Custom Computer Programming Services
    other_naics: ['334418', '541512'],
    uei: 'IRONCLAD38M',
    sba_certifications: [],
    employee_count: 38,
    annual_revenue: 6_400_000,
    certifications: ['CMMC Level 2', 'DO-178C Certified', 'ISO 26262'],
    past_performance: {
      rating: 4.7,
      notable_contracts: ['$4.2M Navy Sonar Processing Unit', '$3.1M Army Tactical Radio Firmware'],
    },
  },

  // LANGUAGE SERVICES + SDVOSB
  {
    name: 'PolyGlot Defense Solutions',
    description: 'Linguistic support services for defense and intelligence operations. Translation, interpretation, cultural advisory, and language training in 47 languages with regional dialect expertise. Security-cleared linguists with in-region experience supporting tactical operations, intelligence analysis, and diplomatic engagement. Veteran-owned with deep understanding of military operational requirements.',
    primary_naics: '541930', // Translation and Interpretation Services
    other_naics: ['611519', '541611'],
    uei: 'POLYGLOT55M',
    sba_certifications: ['SDVOSB'],
    employee_count: 55,
    annual_revenue: 8_200_000,
    certifications: ['Top Secret Facility Clearance', 'ISO 17100:2015'],
    past_performance: {
      rating: 4.8,
      notable_contracts: ['$5.9M USCENTCOM Linguist Support', '$4.1M DIA Translation Services'],
    },
  },
];

export const MOCK_OPPORTUNITIES = [
  // GOLDEN DOME PROGRAM
  {
    notice_id: 'GD-2025-001',
    solicitation_number: 'W31P4Q-25-R-0042',
    title: 'Golden Dome Battle Management Software Integration',
    description: 'Develop and integrate battle management command and control software for Golden Dome air and missile defense system. System must ingest real-time data from 50+ disparate sensor feeds, perform AI-driven threat classification with <2 second latency, coordinate interceptor assets, and provide intuitive operator interfaces. Requires FedRAMP High authorization, zero-trust architecture, and integration with existing C2 systems. 36-month period of performance with options for sustainment.',
    type: 'Solicitation',
    posted_date: new Date('2025-01-15'),
    response_deadline: new Date('2025-03-30'),
    naics_code: '541512',
    classification_code: 'D302', // IT and Telecom - Systems Development
    set_aside_code: null, // Full and open competition
    set_aside_description: null,
    full_parent_path_name: 'Department of Defense.Department of the Army.U.S. Army Contracting Command',
    organization_type: 'OFFICE',
    office_address: {
      city: 'Redstone Arsenal',
      state: 'AL',
      zipcode: '35898',
    },
    additional_info_required: true,
    ui_link: 'https://sam.gov/opp/GD-2025-001/view',
    secondary_naics: ['541511', '334220', '541712'],
    key_requirements: [
      'FedRAMP High authorization',
      'Real-time sensor data fusion from 50+ feeds',
      'AI threat classification <2s latency',
      'Zero-trust security architecture',
      'Active TS/SCI clearances for 80% of workforce',
    ],
    complexity_score: '0.92',
  },

  {
    notice_id: 'GD-2025-002',
    solicitation_number: 'W31P4Q-25-R-0118',
    title: 'Compact AESA Radar Modules for Mobile Air Defense',
    description: 'Design, manufacture, and deliver 120 compact Active Electronically Scanned Array (AESA) radar modules for mobile air defense platforms. GaN-based solid-state technology, 360-degree coverage, simultaneous track of 100+ targets, integration with Golden Dome battle management system. Ruggedized for expeditionary deployment. Requires AS9100D certification and ITAR compliance.',
    type: 'Solicitation',
    posted_date: new Date('2025-02-01'),
    response_deadline: new Date('2025-04-15'),
    naics_code: '334220',
    classification_code: '5895', // Radar Systems and Equipment
    set_aside_code: 'WOSB',
    set_aside_description: 'Women-Owned Small Business Set-Aside',
    full_parent_path_name: 'Department of Defense.Department of the Army.Program Executive Office Missiles and Space',
    organization_type: 'OFFICE',
    office_address: {
      city: 'Huntsville',
      state: 'AL',
      zipcode: '35809',
    },
    ui_link: 'https://sam.gov/opp/GD-2025-002/view',
    secondary_naics: ['541712', '541511'], // May need R&D and embedded software
    key_requirements: [
      'AS9100D certified facility',
      'GaN-based solid-state radar technology',
      'Ruggedized for -40°C to +70°C operation',
      'ITAR registered',
      'Women-owned small business',
    ],
    complexity_score: '0.85',
  },

  // JADC2 PROGRAM
  {
    notice_id: 'JADC2-2025-003',
    solicitation_number: 'HC1028-25-R-0089',
    title: 'Coalition Interoperability Module - Multilingual Data Fusion',
    description: 'Develop coalition interoperability module for JADC2 enabling real-time intelligence sharing with NATO allies. System must support 12 languages with automated translation, cultural context enrichment, and security classification synchronization. Integration with existing JADC2 data fabric, zero-trust architecture, edge deployment capability for contested environments. Requires Top Secret facility clearance.',
    type: 'Solicitation',
    posted_date: new Date('2025-01-20'),
    response_deadline: new Date('2025-04-05'),
    naics_code: '541512',
    classification_code: 'D302',
    set_aside_code: 'SDVOSBC',
    set_aside_description: 'Service-Disabled Veteran-Owned Small Business Set-Aside',
    full_parent_path_name: 'Department of Defense.Office of the Secretary of Defense.Chief Digital and AI Office',
    organization_type: 'OFFICE',
    office_address: {
      city: 'Washington',
      state: 'DC',
      zipcode: '20301',
    },
    ui_link: 'https://sam.gov/opp/JADC2-2025-003/view',
    secondary_naics: [],
    key_requirements: [],
    complexity_score: null,
  },

  {
    notice_id: 'JADC2-2025-004',
    solicitation_number: 'HC1028-25-R-0145',
    title: 'Edge Computing Infrastructure for Tactical JADC2 Nodes',
    description: 'Deploy and sustain edge computing infrastructure at 200+ tactical JADC2 nodes. Ruggedized servers, secure networking equipment, satellite communications integration, and local AI inference capability. Zero-trust architecture, automated patching, continuous monitoring. 8(a) set-aside contract supporting small disadvantaged businesses.',
    type: 'Solicitation',
    posted_date: new Date('2025-02-10'),
    response_deadline: new Date('2025-04-25'),
    naics_code: '541512',
    classification_code: 'D317', // IT and Telecom - Cyber and Data Security
    set_aside_code: 'SBA',
    set_aside_description: '8(a) Small Disadvantaged Business Set-Aside',
    full_parent_path_name: 'Department of Defense.Office of the Secretary of Defense.Defense Information Systems Agency',
    organization_type: 'OFFICE',
    office_address: {
      city: 'Fort Meade',
      state: 'MD',
      zipcode: '20755',
    },
    ui_link: 'https://sam.gov/opp/JADC2-2025-004/view',
    secondary_naics: ['541513', '541519'],
    key_requirements: [
      '8(a) certified small disadvantaged business',
      'CMMC Level 2 minimum',
      'Experience with edge computing deployments',
      'Secret clearance for installation teams',
    ],
    complexity_score: '0.68',
  },

  // STE PROGRAM
  {
    notice_id: 'STE-2025-005',
    solicitation_number: 'W900KK-25-R-0067',
    title: 'Synthetic Training Environment - Coalition Joint Exercises',
    description: 'Develop immersive VR/AR training scenarios for coalition joint exercises with NATO allies. High-fidelity terrain generation from geospatial intelligence, multilingual voice commands, realistic opposing forces with adaptive AI behaviors. Integration with live training instrumentation. Physics-based simulation engines, after-action review analytics. Women-owned small business set-aside.',
    type: 'Solicitation',
    posted_date: new Date('2025-01-25'),
    response_deadline: new Date('2025-04-10'),
    naics_code: '541511',
    classification_code: 'R425', // Training Aids and Devices
    set_aside_code: 'WOSB',
    set_aside_description: 'Women-Owned Small Business Set-Aside',
    full_parent_path_name: 'Department of Defense.Department of the Army.Program Executive Office Simulation, Training and Instrumentation',
    organization_type: 'OFFICE',
    office_address: {
      city: 'Orlando',
      state: 'FL',
      zipcode: '32826',
    },
    ui_link: 'https://sam.gov/opp/STE-2025-005/view',
    secondary_naics: ['611430', '541370', '541930'], // Training, geospatial, translation
    key_requirements: [
      'Women-owned small business',
      'VR/AR development experience',
      'HLA/DIS compliance',
      'Section 508 accessibility',
      'Multilingual UI support',
    ],
    complexity_score: '0.82',
  },

  // MHS-GENESIS PROGRAM
  {
    notice_id: 'MHS-2025-006',
    solicitation_number: 'HT0014-25-R-0034',
    title: 'Telehealth Integration for Remote and Deployed Personnel',
    description: 'Integrate telehealth capabilities into MHS GENESIS electronic health record system. Secure video consultations, remote patient monitoring, e-prescriptions, medical device interoperability. Support for 700+ military treatment facilities and deployed personnel in austere environments. HIPAA/FISMA compliance, mobile app development, bandwidth optimization for SATCOM links.',
    type: 'Solicitation',
    posted_date: new Date('2025-02-05'),
    response_deadline: new Date('2025-04-20'),
    naics_code: '541512',
    classification_code: 'D302',
    set_aside_code: 'SDVOSBC',
    set_aside_description: 'Service-Disabled Veteran-Owned Small Business Set-Aside',
    full_parent_path_name: 'Department of Defense.Defense Health Agency.Program Executive Office, Defense Healthcare Management Systems',
    organization_type: 'OFFICE',
    office_address: {
      city: 'Falls Church',
      state: 'VA',
      zipcode: '22042',
    },
    ui_link: 'https://sam.gov/opp/MHS-2025-006/view',
    secondary_naics: ['541511', '621999'],
    key_requirements: [
      'Service-disabled veteran-owned small business',
      'HIPAA compliance',
      'FISMA Moderate ATO',
      'Oracle Cerner EHR integration experience',
      'Telehealth platform development',
    ],
    complexity_score: '0.75',
  },

  // CBRN-MODERNIZATION PROGRAM
  {
    notice_id: 'CBRN-2025-007',
    solicitation_number: 'W911SR-25-R-0023',
    title: 'Next-Generation Biological Detection Sensors',
    description: 'Design, develop, and field-test autonomous biological detection sensors for CBRN early warning network. PCR-based pathogen identification, aerosol sampling, real-time network reporting. Ruggedized for harsh environments, low false-positive rates, battery life >72 hours. Embedded firmware development for autonomous operation. 8(a) set-aside.',
    type: 'Solicitation',
    posted_date: new Date('2025-01-30'),
    response_deadline: new Date('2025-04-15'),
    naics_code: '541712',
    classification_code: 'A022', // R&D - Physical, Engineering, and Life Sciences
    set_aside_code: 'SBA',
    set_aside_description: '8(a) Small Disadvantaged Business Set-Aside',
    full_parent_path_name: 'Department of Defense.Joint Program Executive Office for CBRN Defense',
    organization_type: 'OFFICE',
    office_address: {
      city: 'Aberdeen Proving Ground',
      state: 'MD',
      zipcode: '21010',
    },
    ui_link: 'https://sam.gov/opp/CBRN-2025-007/view',
    secondary_naics: ['339112', '541511'], // Medical device manufacturing, embedded software
    key_requirements: [
      '8(a) certified small disadvantaged business',
      'Biosafety Level 3 laboratory access',
      'CDC Select Agent registration',
      'Embedded firmware development',
      'ISO 13485 certification',
    ],
    complexity_score: '0.88',
  },

  {
    notice_id: 'CBRN-2025-008',
    solicitation_number: 'W911SR-25-R-0091',
    title: 'CBRN Equipment Rapid Deployment and Logistics',
    description: 'Establish cold-chain logistics network for rapid deployment of CBRN detection equipment and medical countermeasures to 200+ military installations and forward operating bases. Temperature-controlled transport, inventory management, emergency resupply capability within 24 hours CONUS / 72 hours OCONUS. Integration with biosurveillance data systems. 8(a) set-aside.',
    type: 'Solicitation',
    posted_date: new Date('2025-02-15'),
    response_deadline: new Date('2025-05-01'),
    naics_code: '488510',
    classification_code: 'V199', // Transportation/Travel - Other
    set_aside_code: 'SBA',
    set_aside_description: '8(a) Small Disadvantaged Business Set-Aside',
    full_parent_path_name: 'Department of Defense.Defense Logistics Agency.DLA Troop Support',
    organization_type: 'OFFICE',
    office_address: {
      city: 'Philadelphia',
      state: 'PA',
      zipcode: '19111',
    },
    ui_link: 'https://sam.gov/opp/CBRN-2025-008/view',
    secondary_naics: ['493120', '541614'], // Warehousing, logistics consulting
    key_requirements: [
      '8(a) certified small disadvantaged business',
      'Cold-chain logistics experience',
      'FDA registered facilities',
      'ISO 9001 certification',
      'CONUS/OCONUS distribution capability',
    ],
    complexity_score: '0.72',
  },

  // MISCELLANEOUS - BASE INFRASTRUCTURE
  {
    notice_id: 'BASE-2025-009',
    solicitation_number: 'W912PL-25-R-0156',
    title: 'Fort Bragg PFAS Remediation and SCIF Reconstruction',
    description: 'Environmental remediation of PFAS-contaminated groundwater and soil at Fort Bragg, followed by demolition and reconstruction of three Sensitive Compartmented Information Facilities (SCIFs). Bio-filtration systems, sequestration chemistry, regulatory compliance. SCIF construction includes blast-resistant design, secure communications infrastructure, and expedited security accreditation. HUBZone set-aside.',
    type: 'Solicitation',
    posted_date: new Date('2025-02-20'),
    response_deadline: new Date('2025-05-10'),
    naics_code: '236220',
    classification_code: 'Z1DA', // Construction - General Building/Facility
    set_aside_code: 'HZC',
    set_aside_description: 'HUBZone Set-Aside',
    full_parent_path_name: 'Department of Defense.Department of the Army.U.S. Army Corps of Engineers',
    organization_type: 'OFFICE',
    office_address: {
      city: 'Wilmington',
      state: 'NC',
      zipcode: '28403',
    },
    ui_link: 'https://sam.gov/opp/BASE-2025-009/view',
    secondary_naics: ['562910', '541620'], // Remediation, environmental consulting
    key_requirements: [
      'HUBZone certified business',
      'USACE CQM certification',
      'PFAS remediation experience',
      'SCIF accreditation experience',
      'OSHA 30-Hour certification',
    ],
    complexity_score: '0.79',
  },
];


export const MOCK_AWARDS = [
  // GOLDEN DOME PROGRAM - shows large prime + specialized subs pattern
  {
    contract_number: 'W31P4Q-23-C-0089',
    program_code: 'GOLDEN-DOME', // Link to programs table
    naics_code: '541512',
    awarded_date: new Date('2023-06-15'),
    awardee_uei: 'LOCKHEED450L', // Lockheed Martin (large prime)
    sub_ueis: ['AIRWATCH85M', 'CYBERDEF120M'], // AI analytics + cybersecurity subs
    award_amount: 420_000_000,
    performance: 'satisfactory',
  },
  {
    contract_number: 'W31P4Q-22-C-0156',
    program_code: 'GOLDEN-DOME',
    naics_code: '334220', // Radar manufacturing
    awarded_date: new Date('2022-09-20'),
    awardee_uei: 'RAYTHEON380L',
    sub_ueis: ['RFTECH55M', 'TESTLAB38M'],
    award_amount: 285_000_000,
    performance: 'exceptional',
  },
  {
    contract_number: 'W31P4Q-24-C-0067',
    program_code: 'GOLDEN-DOME',
    naics_code: '541712', // R&D for threat modeling
    awarded_date: new Date('2024-03-10'),
    awardee_uei: 'MITRE200L',
    sub_ueis: ['CNTRAIL85M'], // Our Contrail Analytics won as sub!
    award_amount: 87_000_000,
    performance: 'exceptional',
  },

  // JADC2 PROGRAM - Cloud/DevOps heavy, shows 8(a) participation
  {
    contract_number: 'HC1028-23-C-0234',
    program_code: 'JADC2',
    naics_code: '541512',
    awarded_date: new Date('2023-08-05'),
    awardee_uei: 'LEIDOS550L',
    sub_ueis: ['CLOUDFORGE42M', 'ZERODAY180M'], // 8(a) + SDVOSB subs
    award_amount: 310_000_000,
    performance: 'satisfactory',
  },
  {
    contract_number: 'HC1028-22-C-0445',
    program_code: 'JADC2',
    naics_code: '541511',
    awarded_date: new Date('2022-11-18'),
    awardee_uei: 'GDIT480L',
    sub_ueis: ['EDGECOMP68M', 'NETOPS52M'],
    award_amount: 195_000_000,
    performance: 'satisfactory',
  },
  {
    contract_number: 'HC1028-24-C-0089',
    program_code: 'JADC2',
    naics_code: '541512',
    awarded_date: new Date('2024-01-22'),
    awardee_uei: 'APEX650L', // Our mock company as prime!
    sub_ueis: ['POLYGLOT55M', 'CLOUDFORGE42M'], // Translation + cloud services
    award_amount: 142_000_000,
    performance: 'exceptional',
  },

  // STE PROGRAM - Training/simulation ecosystem
  {
    contract_number: 'W900KK-23-C-0178',
    program_code: 'STE',
    naics_code: '541511',
    awarded_date: new Date('2023-05-30'),
    awardee_uei: 'BOHEMIA180L',
    sub_ueis: ['GUARDIAN58M', 'VRDESIGN45M'], // Geospatial + VR
    award_amount: 225_000_000,
    performance: 'exceptional',
  },
  {
    contract_number: 'W900KK-22-C-0289',
    program_code: 'STE',
    naics_code: '541512',
    awarded_date: new Date('2022-10-12'),
    awardee_uei: 'PULSE88M', // Our mock company!
    sub_ueis: ['TRISTI65M', 'GUARDIAN58M'], // Our WOSB + geospatial
    award_amount: 156_000_000,
    performance: 'exceptional',
  },
  {
    contract_number: 'W900KK-24-C-0067',
    program_code: 'STE',
    naics_code: '611430', // Training services
    awarded_date: new Date('2024-02-28'),
    awardee_uei: 'SAIC320L',
    sub_ueis: ['POLYGLOT55M', 'TRISTI65M'], // Translation + VR training
    award_amount: 98_000_000,
    performance: 'satisfactory',
  },

  // MHS-GENESIS PROGRAM - Healthcare IT
  {
    contract_number: 'HT0014-23-C-0456',
    program_code: 'MHS-GENESIS',
    naics_code: '541512',
    awarded_date: new Date('2023-07-20'),
    awardee_uei: 'CERNER380L',
    sub_ueis: ['HEALTHIT95M', 'TELECARE62M'],
    award_amount: 380_000_000,
    performance: 'satisfactory',
  },
  {
    contract_number: 'HT0014-22-C-0234',
    program_code: 'MHS-GENESIS',
    naics_code: '541511',
    awarded_date: new Date('2022-12-08'),
    awardee_uei: 'APEX650L', // Our mock company again
    sub_ueis: ['VETCONN45M', 'MEDDEV58M'], // Our SDVOSB telehealth sub
    award_amount: 167_000_000,
    performance: 'exceptional',
  },
  {
    contract_number: 'HT0014-24-C-0089',
    program_code: 'MHS-GENESIS',
    naics_code: '334510', // Medical device manufacturing
    awarded_date: new Date('2024-04-15'),
    awardee_uei: 'PHILIPS280L',
    sub_ueis: ['IRONCLAD38M'], // Our embedded systems firm for device firmware
    award_amount: 125_000_000,
    performance: 'satisfactory',
  },

  // CBRN-MODERNIZATION PROGRAM - Detection + logistics
  {
    contract_number: 'W911SR-23-C-0123',
    program_code: 'CBRN-MODERNIZATION',
    naics_code: '541712',
    awarded_date: new Date('2023-04-18'),
    awardee_uei: 'BATTELLE250L',
    sub_ueis: ['BIOSHIELD68M', 'IRONCLAD38M'], // Our biosurveillance + embedded
    award_amount: 185_000_000,
    performance: 'exceptional',
  },
  {
    contract_number: 'W911SR-22-C-0267',
    program_code: 'CBRN-MODERNIZATION',
    naics_code: '339112', // Medical equipment manufacturing
    awarded_date: new Date('2022-08-30'),
    awardee_uei: 'BIOSHIELD68M', // Our mock company as prime!
    sub_ueis: ['IRONCLAD38M', 'TESTCERT42M'],
    award_amount: 92_000_000,
    performance: 'exceptional',
  },
  {
    contract_number: 'W911SR-24-C-0045',
    program_code: 'CBRN-MODERNIZATION',
    naics_code: '488510', // Logistics
    awarded_date: new Date('2024-01-10'),
    awardee_uei: 'PATHRENDER220M', // Our mock 8(a) logistics company
    sub_ueis: ['BIOSHIELD68M', 'COLDCHAIN88M'], // Biosurveillance + cold chain
    award_amount: 78_000_000,
    performance: 'satisfactory',
  },

  // BASE INFRASTRUCTURE - Shows construction + remediation pattern
  {
    contract_number: 'W912PL-23-C-0334',
    program_code: null, // Not part of a major program, standalone base infrastructure
    naics_code: '236220',
    awarded_date: new Date('2023-09-15'),
    awardee_uei: 'HZBUILDERS180M',
    sub_ueis: ['ENVIROCARE95M'], // Environmental remediation sub
    award_amount: 58_000_000,
    performance: 'satisfactory',
  },
  {
    contract_number: 'W912PL-22-C-0189',
    program_code: null,
    naics_code: '562910', // Remediation services
    awarded_date: new Date('2022-11-05'),
    awardee_uei: 'TERRASIFT120M', // Our 8(a) remediation company as prime
    sub_ueis: ['GEOSURVEY42M'],
    award_amount: 34_000_000,
    performance: 'exceptional',
  },
  {
    contract_number: 'W912PL-24-C-0067',
    program_code: null,
    naics_code: '236220',
    awarded_date: new Date('2024-03-20'),
    awardee_uei: 'RIDGELINE180M', // Our HUBZone construction company
    sub_ueis: ['TERRASIFT120M', 'SCIFBUILD55M'], // Our 8(a) remediation + SCIF specialist
    award_amount: 67_000_000,
    performance: 'satisfactory',
  },
];
export const MOCK_COMPANIES = [
  // AI/ML SPECIALISTS FOR THREAT DETECTION - need primes
  {
    name: 'Contrail Analytics',
    description: 'Contrail Analytics develops flight data monitoring and anomaly detection systems for unmanned aerial vehicles (UAVs) and aerospace fleets. We integrate advanced telemetry analytics with predictive maintenance algorithms, enabling early identification of risks before they become failures. Our platforms enhance mission safety, extend aircraft lifespans, and support both defense and civilian aviation programs with reliable, realtime insights required of high-stakes airspace operations.',
    primary_naics: '541710',
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
    other_naics: ['325211', '541710'],
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
    primary_naics: '541710', // Research and Development in the Physical, Engineering, and Life Sciences
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
    primary_naics: '541710',
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
    primary_naics: '541710',
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
    other_naics: ['334290', '541710'],
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

export const EXTENDED_MOCK_COMPANIES = [
  // WOSB/EDWOSB — software & training (great for STE + WOSB)
  {
    name: 'Aurora Training Systems',
    description: 'Immersive training software (VR/AR) and performance analytics for DHS/DoD programs. SCORM/LMS integrations and Section 508 compliance.',
    primary_naics: '541511',
    other_naics: ['541512', '611430'],
    uei: 'AURORA60W',
    sba_certifications: ['WOSB'],
    employee_count: 60,
    annual_revenue: 7_400_000,
    certifications: ['Section 508', 'ISO 9001:2015'],
    past_performance: { rating: 4.5, notable_contracts: ['$5.1M FEMA Incident Command Training', '$3.2M TSA Screener Readiness'] },
  },
  {
    name: 'SoftBridge Solutions',
    description: 'Custom application development for case management, secure portals, and data exchange in GovCloud environments.',
    primary_naics: '541511',
    other_naics: ['541512', '541519'],
    uei: 'SOFTBRIDGE68W',
    sba_certifications: ['WOSB'],
    employee_count: 68,
    annual_revenue: 9_100_000,
    certifications: ['AWS GovCloud Partner', 'CMMC Level 2'],
    past_performance: { rating: 4.4, notable_contracts: ['$3.9M DOJ Case Management', '$2.7M HHS Provider Portal'] },
  },
  {
    name: 'Aegis Wave Systems',
    description: 'Compact RF front-ends and antenna modules for radar/ISR; rapid prototyping of GaN-based AESA tiles.',
    primary_naics: '334220',
    other_naics: ['334290', '541511'],
    uei: 'AEGIS58E',
    sba_certifications: ['EDWOSB'],
    employee_count: 58,
    annual_revenue: 12_100_000,
    certifications: ['AS9100D', 'ITAR Registered'],
    past_performance: { rating: 4.6, notable_contracts: ['$6.2M Army Counter-UAS RF Modules', '$3.4M ONR AESA Prototype'] },
  },
  {
    name: 'Violet Signal Systems',
    description: 'Microwave assemblies and waveform agile transceivers for EW and air defense platforms.',
    primary_naics: '334220',
    other_naics: ['541511', '334290'],
    uei: 'VIOLETSIGNAL52E',
    sba_certifications: ['EDWOSB'],
    employee_count: 52,
    annual_revenue: 10_800_000,
    certifications: ['AS9100D', 'ISO 9001:2015'],
    past_performance: { rating: 4.5, notable_contracts: ['$4.1M AFRL Agile RF Front-End', '$3.0M Navy EW LRU Build'] },
  },

  // 8(a) — cloud/devsecops & data (mentor/protégé candidates)
  {
    name: 'Nimbus Labs Federal',
    description: 'DevSecOps pipelines, IaC, and multi-cloud landing zones with ATO acceleration in GovCloud.',
    primary_naics: '541511',
    other_naics: ['541512', '541519'],
    uei: 'NIMBUS44A',
    sba_certifications: ['8A'],
    employee_count: 44,
    annual_revenue: 5_200_000,
    certifications: ['FedRAMP 3PAO Recognized', 'CMMC Level 2'],
    past_performance: { rating: 4.3, notable_contracts: ['$2.9M VA ATO Fast-Track', '$2.2M USDA CICD Modernization'] },
  },
  {
    name: 'Meridian ISR Systems',
    description: 'Real-time ISR data fusion and tasking tools; geospatial pipelines and on-platform edge analytics.',
    primary_naics: '541512',
    other_naics: ['541370', '541710'],
    uei: 'MERIDISR85A',
    sba_certifications: ['8A'],
    employee_count: 85,
    annual_revenue: 12_600_000,
    certifications: ['NGA GEOINT Accredited', 'ISO 9001:2015'],
    past_performance: { rating: 4.6, notable_contracts: ['$7.1M AF DCGS Toolchain', '$3.8M SOCOM Full-Motion Video'] },
  },

  // HUBZone — construction / facilities / power
  {
    name: 'Blue Ridge Federal Constructors',
    description: 'Secure facilities and base infrastructure; SCIF buildouts, comms hardening, and fast-track renovations.',
    primary_naics: '236220',
    other_naics: ['238210', '541330'],
    uei: 'BLUERIDGE140H',
    sba_certifications: ['HZ'],
    employee_count: 140,
    annual_revenue: 41_000_000,
    certifications: ['USACE CQM', 'SCIF Accredited'],
    past_performance: { rating: 4.5, notable_contracts: ['$22.4M Fort Eustis Command Center', '$14.9M Navy Secure Facilities'] },
  },
  {
    name: 'Horizon Microgrids',
    description: 'Design-build resilient microgrids and backup power for critical DoD sites; controls, SCADA, and cybersecurity.',
    primary_naics: '541330',
    other_naics: ['238210', '541512'],
    uei: 'HORIZON72W',
    sba_certifications: ['WOSB'],
    employee_count: 72,
    annual_revenue: 13_200_000,
    certifications: ['PE-Led Designs', 'ISO 27001'],
    past_performance: { rating: 4.4, notable_contracts: ['$6.4M USMC Microgrid Retrofit', '$3.1M ANG Resiliency Upgrade'] },
  },

  // SDVOSB — networking / cyber / EW support
  {
    name: 'Forward Deployed Networks',
    description: 'Tactical networking, SATCOM integration, and deployable comms for expeditionary operations.',
    primary_naics: '541512',
    other_naics: ['541513', '541519'],
    uei: 'FDN120S',
    sba_certifications: ['SDVOSB'],
    employee_count: 120,
    annual_revenue: 21_500_000,
    certifications: ['CMMC Level 2', 'Cisco Gold'],
    past_performance: { rating: 4.6, notable_contracts: ['$8.8M Army Tactical WAN', '$5.2M USMC SATCOM Kit'] },
  },
  {
    name: 'RavenWorks EW',
    description: 'EW test and evaluation software, jammer integration, and mission-data reprogramming.',
    primary_naics: '541512',
    other_naics: ['334290', '541513'],
    uei: 'RAVEN88S',
    sba_certifications: ['SDVOSB'],
    employee_count: 88,
    annual_revenue: 16_900_000,
    certifications: ['CMMC Level 2', 'ITAR Registered'],
    past_performance: { rating: 4.7, notable_contracts: ['$6.1M Navy EW T&E Tooling', '$4.4M USAF Jammer Support'] },
  },

  // R&D / biosurveillance / analytics
  {
    name: 'Quanta Dynamics R&D',
    description: 'Modeling & simulation and laboratory analytics across sensors and bio-manufacturing transitions.',
    primary_naics: '541710',
    other_naics: ['541511', '325414'],
    uei: 'QUANTA36',
    sba_certifications: [],
    employee_count: 36,
    annual_revenue: 3_900_000,
    certifications: ['ISO 17025', 'GLP'],
    past_performance: { rating: 4.5, notable_contracts: ['$1.9M DARPA Transition Analytics', '$1.2M DOE TEA Models'] },
  },
  {
    name: 'Arcadia GeoAnalytics',
    description: 'Hyperspectral change detection and terrain analytics; 3D reconstruction and temporal analysis.',
    primary_naics: '541710',
    other_naics: ['541370', '541990'],
    uei: 'ARCADIA38A',
    sba_certifications: ['8A'],
    employee_count: 38,
    annual_revenue: 4_100_000,
    certifications: ['NGA GEOINT Accredited'],
    past_performance: { rating: 4.6, notable_contracts: ['$2.7M USACE Terrain Modeling', '$1.6M NGA Site Monitoring'] },
  },

  // Logistics / medical supply chain
  {
    name: 'Atlas Maritime Logistics',
    description: 'Time-definite, temperature-controlled logistics for medical and mission-critical cargo.',
    primary_naics: '488510',
    other_naics: ['493120', '541614'],
    uei: 'ATLAS200A',
    sba_certifications: ['8A'],
    employee_count: 200,
    annual_revenue: 33_500_000,
    certifications: ['TAPA FSR A', 'ISO 9001:2015'],
    past_performance: { rating: 4.4, notable_contracts: ['$18.7M SNS Cold-Chain', '$9.2M DLA Rapid Resupply'] },
  },

  // Components / sensors
  {
    name: 'IronPeak Sensors',
    description: 'Ruggedized sensor modules, RF front-ends, and integration firmware for ISR payloads.',
    primary_naics: '334290',
    other_naics: ['541511', '541512'],
    uei: 'IRONPEAK62',
    sba_certifications: [],
    employee_count: 62,
    annual_revenue: 9_800_000,
    certifications: ['AS9100D', 'IPC-A-610'],
    past_performance: { rating: 4.5, notable_contracts: ['$3.7M SOCOM ISR Sensor Mods', '$2.6M Navy RF LRU'] },
  },

  // More WOSB/EDWOSB software — to ensure qual hits for WOSB opps
  {
    name: 'Vega Analytics',
    description: 'Full-stack data applications, pipelines, and ML microservices for mission systems.',
    primary_naics: '541511',
    other_naics: ['541512', '541519'],
    uei: 'VEGA64E',
    sba_certifications: ['EDWOSB'],
    employee_count: 64,
    annual_revenue: 8_600_000,
    certifications: ['AWS GovCloud', 'CMMC Level 2'],
    past_performance: { rating: 4.4, notable_contracts: ['$3.1M AF DCGS Data Apps', '$2.4M DHS Analytics'] },
  },
  {
    name: 'HarborSat Communications',
    description: 'Mission communications apps, SATCOM control tooling, and ground segment integration.',
    primary_naics: '541512',
    other_naics: ['541511', '541519'],
    uei: 'HARBORSAT70W',
    sba_certifications: ['WOSB'],
    employee_count: 70,
    annual_revenue: 11_300_000,
    certifications: ['DoDIN APL Experience', 'ISO 27001'],
    past_performance: { rating: 4.5, notable_contracts: ['$4.0M Space Force Ground Apps', '$2.9M USCG SATCOM Tools'] },
  },
  {
    name: 'Dynaworks Robotics',
    description: 'Autonomy SDKs and HIL simulation for UAS/UGV swarms; perception and guidance stacks.',
    primary_naics: '541511',
    other_naics: ['541512', '336411'],
    uei: 'DYNA95',
    sba_certifications: [],
    employee_count: 95,
    annual_revenue: 15_200_000,
    certifications: ['ISO 9001:2015'],
    past_performance: { rating: 4.7, notable_contracts: ['$6.5M Army Autonomy Stack', '$3.8M ONR Swarm Sim'] },
  },
  {
    name: 'Granite Data Systems',
    description: 'Sustainment apps, ITAM tooling, and enterprise integrations for defense agencies.',
    primary_naics: '541519',
    other_naics: ['541512', '541511'],
    uei: 'GRANITE110',
    sba_certifications: [],
    employee_count: 110,
    annual_revenue: 19_400_000,
    certifications: ['ITIL v4', 'ISO 20000'],
    past_performance: { rating: 4.3, notable_contracts: ['$7.1M Navy ITAM', '$4.2M Army ERP Extensions'] },
  },
];

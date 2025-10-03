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
    naics_code: '541710', // R&D for threat modeling
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
    naics_code: '541710',
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
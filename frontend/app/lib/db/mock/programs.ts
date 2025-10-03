export const MOCK_PROGRAMS = [
  {
    code: 'GOLDEN-DOME', // Layered Defense
    name: 'Golden Dome Integrated Air and Missile Defense',
    description: 'Multi-layered air and missile defense system integrating advanced radar networks, AI-powered threat classification, interceptor coordination, and battle management command and control. Protects critical infrastructure and forward-deployed forces from hypersonic missiles, cruise missiles, UAS swarms, and ballistic threats. Leverages machine learning for real-time threat assessment and autonomous engagement sequencing.',
    estimated_value: 18_500_000_000,
    key_naics: ['541512', '541511', '334220', '541710', '336414'],
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
    key_naics: ['541710', '339112', '541380', '488510'],
    prime_contractors: ['Battelle Memorial Institute', 'Amentum', 'CSRA'],
  },
];

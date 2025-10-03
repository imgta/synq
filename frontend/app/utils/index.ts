export type ReasonKind = 'pass' | 'fail' | 'warn' | 'info' | 'weak' | 'jv';

export interface Reason {
  kind: ReasonKind;
  text: string;
}

export interface FitScoreMetrics {
  naicsScore: number;
  setAsideScore: number;
  sizeScore: number;
  capabilityScore: number;
  overallScore: number;
  eligible: boolean;
  setAsideRequired: boolean;
  reasoning: Reason[];
}

export interface CompanyFitMetrics {
  primary_naics: string;
  other_naics: string[];
  sba_certifications: string[];
  employee_count: number;
  annual_revenue: number;
}

export interface OpportunityFitMetrics {
  naics_code: string;
  secondary_naics?: string[];
  set_aside_code?: string | null;
  estimated_value?: number;
}

export function computeFitScore(company: CompanyFitMetrics, opportunity: OpportunityFitMetrics): FitScoreMetrics {
  const reasoning: Reason[] = [];
  const add = (kind: ReasonKind, text: string) => reasoning.push({ kind, text });

  const setAsideRequired = Boolean(opportunity.set_aside_code);
  const companyNAICS = [company.primary_naics, ...company.other_naics];
  const allOpportunityNAICS = [opportunity.naics_code, ...(opportunity.secondary_naics || [])];

  // NAICS ALIGNMENT (40%)
  let naicsScore = 0;
  if (company.primary_naics === opportunity.naics_code) {
    naicsScore = 100;
    add('pass', 'Primary NAICS match');
  } else if (opportunity.secondary_naics?.includes(company.primary_naics)) {
    naicsScore = 85;
    add('pass', 'Primary NAICS in secondary');
  } else if (companyNAICS.some(nc => allOpportunityNAICS.includes(nc))) {
    naicsScore = 75;
    add('info', 'Secondary NAICS match');
  } else if (companyNAICS.some(co => allOpportunityNAICS.some(opp => co.substring(0, 5) === opp.substring(0, 5)))) {
    naicsScore = 60;
    add('info', '5-digit industry match');
  } else if (companyNAICS.some(co => allOpportunityNAICS.some(opp => co.substring(0, 4) === opp.substring(0, 4)))) {
    naicsScore = 45;
    add('weak', '4-digit group match');
  } else if (companyNAICS.some(co => allOpportunityNAICS.some(opp => co.substring(0, 3) === opp.substring(0, 3)))) {
    naicsScore = 30;
    add('weak', '3-digit subsector');
  } else if (companyNAICS.some(co => allOpportunityNAICS.some(opp => co.substring(0, 2) === opp.substring(0, 2)))) {
    naicsScore = 15;
    add('weak', '2-digit sector');
  } else {
    add('fail', 'No NAICS match');
  }

  // SET-ASIDE (30%)
  let eligible = true;
  let setAsideScore = 0;

  if (opportunity.set_aside_code) {
    const setAsideMap: Record<string, string[]> = {
      SBA: ['SB'],
      SB: ['SB'],
      SDVOSBC: ['VO', 'SDVOSB'],
      WOSB: ['WO', 'WOSB'],
      EDWOSB: ['WO', 'EDWOSB'],
      '8A': ['8a', '8A'],
      HZC: ['HZ', 'HUBZone'],
    };

    const requiredCerts = setAsideMap[opportunity.set_aside_code] || [opportunity.set_aside_code];
    const hasRequiredCert = requiredCerts.some(cert =>
      company.sba_certifications.some(c => c.toUpperCase().includes(cert.toUpperCase())),
    );

    if (hasRequiredCert) {
      setAsideScore = 100;
      add('pass', `Meets ${opportunity.set_aside_code} set-aside`);
    } else {
      setAsideScore = 0;
      eligible = false;
      add('fail', `Requires ${opportunity.set_aside_code} cert`);
    }
  } else {
    setAsideScore = 100;
    add('info', 'Full & open (no set-aside)');
  }

  // SIZE/CAPACITY (20%)
  let sizeScore = 100;
  if (opportunity.estimated_value) {
    const revenueRatio = company.annual_revenue / opportunity.estimated_value;
    if (revenueRatio >= 3) {
      sizeScore = 100;
      add('pass', 'Strong financial capacity');
    } else if (revenueRatio >= 1.5) {
      sizeScore = 80;
      add('info', 'Adequate financial capacity');
    } else if (revenueRatio >= 0.5) {
      sizeScore = 60;
      add('jv', 'Moderate capacity (JV candidate)');
    } else {
      sizeScore = 30;
      add('jv', 'Limited capacity (JV candidate)');
    }
  }

  if (company.employee_count < 50 && opportunity.naics_code.startsWith('54')) {
    sizeScore = Math.min(sizeScore, 70);
    add('warn', 'Small team (delivery scale risk)');
  }

  // CAPABILITY DEPTH (10%)
  let capabilityScore = 0;
  const naicsCount = companyNAICS.length;
  if (naicsCount >= 4) {
    capabilityScore = 100;
    add('pass', 'Diverse capability portfolio');
  } else if (naicsCount === 3) {
    capabilityScore = 80;
  } else if (naicsCount === 2) {
    capabilityScore = 60;
  } else {
    capabilityScore = 40;
    add('weak', 'Limited NAICS portfolio');
  }

  if (opportunity.secondary_naics?.length) {
    const secondaryCoverage =
      opportunity.secondary_naics.filter(sn => companyNAICS.includes(sn)).length /
      opportunity.secondary_naics.length;

    if (secondaryCoverage >= 0.5) {
      capabilityScore = Math.min(100, capabilityScore + 15);
      add('pass', 'Secondary req. coverage ≥50%');
    }
  }

  const overallScore = Math.round(
    naicsScore * 0.4 + setAsideScore * 0.3 + sizeScore * 0.2 + capabilityScore * 0.1,
  );

  return {
    naicsScore,
    setAsideScore,
    sizeScore,
    capabilityScore,
    overallScore,
    eligible,
    setAsideRequired,
    reasoning,
  };
}
import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MOCK_COMPANIES, MOCK_OPPORTUNITIES } from '@/lib/db/mock';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Building2, Target } from 'lucide-react';

interface FitScoreMetrics {
  naicsScore: number;
  setAsideScore: number;
  sizeScore: number;
  capabilityScore: number;
  overallScore: number;
  eligible: boolean;
  reasoning: string[];
}

interface CompanyFitMetrics {
  primary_naics: string;
  other_naics: string[];
  sba_certifications: string[];
  employee_count: number;
  annual_revenue: number;
}

interface OpportunityFitMetrics {
  naics_code: string;
  secondary_naics?: string[];
  set_aside_code?: string;
  estimated_value?: number;
}

function computeFitScore(
  company: CompanyFitMetrics,
  opportunity: OpportunityFitMetrics,
): FitScoreMetrics {
  const reasoning: string[] = [];

  // ===========================
  // 1. NAICS ALIGNMENT (40% weight)
  // ===========================
  let naicsScore = 0;
  const companyNAICS = [company.primary_naics, ...company.other_naics];
  const allOpportunityNAICS = [opportunity.naics_code, ...(opportunity.secondary_naics || [])];

  // Primary NAICS perfect match
  if (company.primary_naics === opportunity.naics_code) {
    naicsScore = 100;
    reasoning.push('✓ Primary NAICS is exact match');
  }
  // Primary matches any secondary requirement
  else if (opportunity.secondary_naics?.includes(company.primary_naics)) {
    naicsScore = 85;
    reasoning.push('✓ Primary NAICS matches secondary requirement');
  }
  // Any NAICS exact match
  else if (companyNAICS.some(nc => allOpportunityNAICS.includes(nc))) {
    naicsScore = 75;
    reasoning.push('✓ Secondary NAICS matches opportunity');
  }
  // 5-digit match (national industry level)
  else if (companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 5) === opp.substring(0, 5))
  )) {
    naicsScore = 60;
    reasoning.push('○ NAICS match at industry level (5-digit)');
  }
  // 4-digit match (industry group level)
  else if (companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 4) === opp.substring(0, 4))
  )) {
    naicsScore = 45;
    reasoning.push('○ NAICS match at industry group (4-digit)');
  }
  // 3-digit match (subsector level)
  else if (companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 3) === opp.substring(0, 3))
  )) {
    naicsScore = 30;
    reasoning.push('△ NAICS match at subsector (3-digit)');
  }
  // 2-digit match (sector level only)
  else if (companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 2) === opp.substring(0, 2))
  )) {
    naicsScore = 15;
    reasoning.push('△ Weak NAICS match at sector level only');
  } else {
    reasoning.push('✗ No NAICS alignment detected');
  }

  // ===========================
  // 2. SET-ASIDE ELIGIBILITY (30% weight)
  // ===========================
  let setAsideScore = 0;
  let eligible = true;

  if (opportunity.set_aside_code) {
    // Map common set-aside codes
    const setAsideMap: Record<string, string[]> = {
      'SBA': ['SB'],
      'SB': ['SB'],
      'SDVOSBC': ['VO', 'SDVOSB'],
      'WOSB': ['WO', 'WOSB'],
      'EDWOSB': ['WO', 'EDWOSB'],
      '8A': ['8a', '8A'],
      'HZC': ['HZ', 'HUBZone'],
    };

    const requiredCerts = setAsideMap[opportunity.set_aside_code] || [opportunity.set_aside_code];
    const hasRequiredCert = requiredCerts.some(cert =>
      company.sba_certifications.some(c => c.toUpperCase().includes(cert.toUpperCase()))
    );

    if (hasRequiredCert) {
      setAsideScore = 100;
      reasoning.push(`✓ Certified for ${opportunity.set_aside_code} set-aside`);
    } else {
      setAsideScore = 0;
      eligible = false;
      reasoning.push(`✗ NOT certified for required ${opportunity.set_aside_code} set-aside`);
    }
  } else {
    // No set-aside = full and open competition
    setAsideScore = 100;
    reasoning.push('○ Full and open competition (no set-aside)');
  }

  // ===========================
  // 3. SIZE/CAPABILITY MATCH (20% weight)
  // ===========================
  let sizeScore = 100; // default to neutral

  // NAICS size standards vary, but rough heuristics:
  // - Small business: typically <500 employees OR <$7.5M-$41.5M revenue
  // - Large contracts may require significant capacity

  if (opportunity.estimated_value) {
    const revenueRatio = company.annual_revenue / opportunity.estimated_value;

    if (revenueRatio >= 3) {
      sizeScore = 100;
      reasoning.push('✓ Strong financial capacity for contract value');
    } else if (revenueRatio >= 1.5) {
      sizeScore = 80;
      reasoning.push('○ Adequate financial capacity');
    } else if (revenueRatio >= 0.5) {
      sizeScore = 60;
      reasoning.push('△ Moderate financial capacity - may need partners');
    } else {
      sizeScore = 30;
      reasoning.push('⚠ Limited financial capacity - joint venture recommended');
    }
  }

  // Employee count considerations for service contracts
  if (company.employee_count < 50 && opportunity.naics_code.startsWith('54')) {
    // Professional/technical services with small team
    reasoning.push('○ Small team may limit capacity for large-scale delivery');
    sizeScore = Math.min(sizeScore, 70);
  }

  // ===========================
  // 4. CAPABILITY DEPTH (10% weight)
  // ===========================
  let capabilityScore = 0;
  const naicsCount = companyNAICS.length;

  if (naicsCount >= 4) {
    capabilityScore = 100;
    reasoning.push('✓ Diverse capability portfolio');
  } else if (naicsCount === 3) {
    capabilityScore = 80;
  } else if (naicsCount === 2) {
    capabilityScore = 60;
  } else {
    capabilityScore = 40;
    reasoning.push('△ Limited NAICS portfolio - consider partnerships');
  }

  // Bonus for secondary NAICS coverage
  if (opportunity.secondary_naics && opportunity.secondary_naics.length > 0) {
    const secondaryCoverage = opportunity.secondary_naics.filter(sn =>
      companyNAICS.includes(sn)
    ).length / opportunity.secondary_naics.length;

    if (secondaryCoverage >= 0.5) {
      capabilityScore = Math.min(100, capabilityScore + 15);
      reasoning.push('✓ Covers multiple secondary requirements');
    }
  }

  // ===========================
  // WEIGHTED OVERALL SCORE
  // ===========================
  const overallScore = Math.round(
    (naicsScore * 0.40) +
    (setAsideScore * 0.30) +
    (sizeScore * 0.20) +
    (capabilityScore * 0.10)
  );

  return {
    naicsScore,
    setAsideScore,
    sizeScore,
    capabilityScore,
    overallScore,
    eligible,
    reasoning,
  };
}

// calculate fit score based on NAICS code alignment
function calculateFitScore(companyNAICS: string[], opportunityNAICS: string, secondaryNAICS: string[] = []): number {
  const allOpportunityNAICS = [opportunityNAICS, ...secondaryNAICS];

  const primaryMatch = companyNAICS[0] === opportunityNAICS;
  const anyMatch = companyNAICS.some(nc => allOpportunityNAICS.includes(nc));

  // scoring (0-100)
  if (primaryMatch) return 100;
  if (anyMatch) return 75;

  // partial 4-digit NAICS match (industry group)
  const partialMatch = companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 4) === opp.substring(0, 4)),
  );
  if (partialMatch) return 50;

  // weak match based on first 2 digits (sector)
  const weakMatch = companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 2) === opp.substring(0, 2)),
  );
  if (weakMatch) return 25;

  return 0;
}

const chartConfig = {
  fit: {
    label: 'Fit Score',
    color: 'var(--chart-1)', // using the same color from your original Radar component
  },
} satisfies ChartConfig;

export function DataRadarChart() {
  const [selectedCompany, setSelectedCompany] = useState(MOCK_COMPANIES[0].name);

  const company = MOCK_COMPANIES.find(co => co.name === selectedCompany);
  if (!company) return null;
  const companyNAICS = [company.primary_naics, ...company.other_naics];

  const radarData = MOCK_OPPORTUNITIES.map(opp => {
    const fitAnalysis = computeFitScore(company, opp);

    return {
      opportunity: opp.title.length > 40 ? opp.title.substring(0, 40) + '...' : opp.title,
      fullTitle: opp.title,
      fit: fitAnalysis.overallScore,
      naicsScore: fitAnalysis.naicsScore,
      setAsideScore: fitAnalysis.setAsideScore,
      sizeScore: fitAnalysis.sizeScore,
      capabilityScore: fitAnalysis.capabilityScore,
      eligible: fitAnalysis.eligible,
      reasoning: fitAnalysis.reasoning,
      noticeId: opp.notice_id,
      naicsCode: opp.naics_code,
      setAside: opp.set_aside_code,
    };
  }).sort((a, b) => b.fit - a.fit);

  // Filter to only eligible opportunities or show warning
  const eligibleOpportunities = radarData.filter(o => o.eligible);
  const topOpportunities = eligibleOpportunities.slice(0, 6);

  // // calculate fit scores for all opportunities
  // const radarData = MOCK_OPPORTUNITIES.map(opp => {
  //   const fitScore = calculateFitScore(companyNAICS, opp.naics_code, opp.secondary_naics || []);
  //   return {
  //     opportunity: opp.title.length > 40 ? opp.title.substring(0, 40) + '...' : opp.title,
  //     fullTitle: opp.title,
  //     fit: fitScore,
  //     noticeId: opp.notice_id,
  //     naicsCode: opp.naics_code,
  //     setAside: opp.set_aside_code,
  //   };
  // }).sort((a, b) => b.fit - a.fit);
  // // top 6 opportunities for hexagonal radar chart
  // const topOpportunities = radarData.slice(0, 6);

  return (
    <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm p-8 ">
      <div className="space-y-6">
        {/* HEADER */}
        <section className="flex items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Target className="size-5 text-primary" />
              <h3 className="text-xl font-normal tracking-tight">Opportunity Fit Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Radar chart showing how closely a company&apos;s NAICS codes align with contract opportunities
            </p>
          </div>

          {/* COMPANY DROPDOWN */}
          <div className="w-auto">
            <Select
              value={selectedCompany}
              onValueChange={setSelectedCompany}
            >
              <SelectTrigger className="border-border/60 bg-background w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MOCK_COMPANIES.map(company =>
                  <SelectItem key={company.uei} value={company.name}>
                    <div className="flex items-center gap-2">
                      <Building2 className="size-4 text-muted-foreground" />
                      <span>{company.name}</span>
                    </div>
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </section>

        {/* COMPANY CARD */}
        <section className="p-4 rounded-lg bg-secondary/30 border border-border/40 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1 flex-1">
              <h4 className="font-normal text-base">{company.name}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{company.description}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className="bg-primary/5 border-primary/25 text-primary text-xs">
              {company.primary_naics}
            </Badge>
            {company.other_naics.slice(0, 3).map(naics =>
              <Badge key={naics} variant="outline" className="bg-secondary border-border/40 text-xs">
                {naics}
              </Badge>
            )}
            {company.sba_certifications.length > 0 &&
              <Badge variant="outline" className="bg-accent/50 border-accent text-xs">
                {company.sba_certifications.join(', ')}
              </Badge>
            }
          </div>
        </section>

        {/* RADAR CHART */}
        <div className="h-[400px] w-full">
          <ChartContainer config={chartConfig} className="size-full">
            <RadarChart data={topOpportunities}>
              <PolarGrid stroke="var(--grid-1)" strokeWidth={1} />
              <PolarAngleAxis
                dataKey="opportunity"
                tick={{ fill: "var(--foreground)", fontSize: 11 }}
                tickLine={false}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: "var(--grid-1)", fontSize: 10 }}
                tickCount={5}
              />
              <Radar
                dataKey="fit"
                stroke="var(--color-fit)"
                fill="var(--color-fit)"
                fillOpacity={0.3}
                strokeWidth={2}
              />
              <ChartTooltip
                cursor={false}
                content={
                  <ChartTooltipContent
                    hideLabel
                    className="bg-card/75 backdrop-blur-sm border-border/15"
                    formatter={(value, name, props) => {
                      const { payload } = props;
                      return (
                        <div className="w-[250px] space-y-1">
                          <p className="text-xs font-normal text-balance">{payload.fullTitle}</p>
                          <div className="space-y-1">
                            <p className="text-xs text-muted-foreground">
                              Fit Score: <span className="text-foreground font-medium">{payload.fit}%</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                              NAICS: <span className="text-foreground">{payload.naicsCode}</span>
                            </p>
                            {payload.setAside &&
                              <p className="text-xs text-muted-foreground">
                                Set-Asides: <span className="text-foreground">{payload.setAside}</span>
                              </p>
                            }
                          </div>
                        </div>
                      );
                    }}
                  />
                }
              />
            </RadarChart>
          </ChartContainer>
        </div>

        {/* LEGEND */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border/40">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary" />
              <span className="text-xs text-muted-foreground">100% - Perfect Match</span>
            </div>
            <p className="text-xs text-muted-foreground/70 pl-5">Primary NAICS matches</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/75" />
              <span className="text-xs text-muted-foreground">75% - Strong Match</span>
            </div>
            <p className="text-xs text-muted-foreground/70 pl-5">Any NAICS matches</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/50" />
              <span className="text-xs text-muted-foreground">50% - Partial Match</span>
            </div>
            <p className="text-xs text-muted-foreground/70 pl-5">Industry group match</p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-primary/25" />
              <span className="text-xs text-muted-foreground">25% - Weak Match</span>
            </div>
            <p className="text-xs text-muted-foreground/70 pl-5">Sector match only</p>
          </div>
        </section>

        {/* TOP OPPORTUNITIES */}
        <section className="space-y-3 pt-4 border-t border-border/40">
          <h4 className="text-sm font-normal text-muted-foreground">Top Matching Opportunities</h4>
          <div className="space-y-2">
            {topOpportunities.slice(0, 3).map(opp =>
              <div
                key={opp.noticeId}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/30 hover:bg-secondary/30 transition-colors"
              >
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-foreground">{opp.fullTitle}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs bg-background">
                      {opp.naicsCode}
                    </Badge>
                    {opp.setAside && <span className="text-xs text-muted-foreground">{opp.setAside}</span>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-normal text-primary">{opp.fit}%</span>
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </Card>
  );
}

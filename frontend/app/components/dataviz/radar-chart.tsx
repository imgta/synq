import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Building2, Target, Users } from 'lucide-react';

// Mock data structure
const MOCK_COMPANIES = [
  {
    name: "Contrail Analytics",
    description: "Advanced telemetry analytics and predictive maintenance for UAVs",
    primary_naics: "541712",
    other_naics: ["336411", "541511", "541513"],
    sba_certifications: ["SB"],
    employee_count: 85,
    annual_revenue: 12000000,
    uei: "MOCK-1"
  },
  {
    name: "Terra Sift",
    description: "Environmental cleanup for hazardous contaminants",
    primary_naics: "562910",
    other_naics: ["541620", "541380"],
    sba_certifications: ["SB", "8a"],
    employee_count: 120,
    annual_revenue: 18500000,
    uei: "MOCK-2"
  },
  {
    name: "ZeroDay Cybersecurity",
    description: "Comprehensive defensive cybersecurity services",
    primary_naics: "541512",
    other_naics: ["541513", "541519"],
    sba_certifications: ["SB", "VO"],
    employee_count: 180,
    annual_revenue: 28000000,
    uei: "MOCK-3"
  },
  {
    name: "VetConnect Telehealth",
    description: "Secure telemedicine solutions for working animals",
    primary_naics: "541511",
    other_naics: ["621910", "541512"],
    sba_certifications: ["SB", "VO"],
    employee_count: 45,
    annual_revenue: 6200000,
    uei: "MOCK-4"
  },
  {
    name: "OnBlur Inc.",
    description: "AI-driven e-discovery and redaction services",
    primary_naics: "541511",
    other_naics: ["541512", "541519"],
    sba_certifications: ["SB"],
    employee_count: 35,
    annual_revenue: 4800000,
    uei: "MOCK-5"
  },
  {
    name: "Stylefoam Solutions",
    description: "Biodegradable packaging for field operations",
    primary_naics: "326111",
    other_naics: ["325211", "541712"],
    sba_certifications: ["SB", "8a"],
    employee_count: 150,
    annual_revenue: 22000000,
    uei: "MOCK-6"
  },
  {
    name: "Pathrender Logistics",
    description: "Cold-chain transport and rapid resupply solutions",
    primary_naics: "488510",
    other_naics: ["493120", "541614"],
    sba_certifications: ["SB", "8a"],
    employee_count: 220,
    annual_revenue: 32000000,
    uei: "MOCK-7"
  }
];

const MOCK_OPPORTUNITIES = [
  {
    title: "Cybersecurity Infrastructure Modernization",
    notice_id: "OPP-001",
    naics_code: "541512",
    secondary_naics: ["541513"],
    set_aside_code: "SB",
    estimated_value: 5000000
  },
  {
    title: "UAV Fleet Maintenance Analytics Platform",
    notice_id: "OPP-002",
    naics_code: "541712",
    secondary_naics: ["336411"],
    set_aside_code: null,
    estimated_value: 8000000
  },
  {
    title: "Environmental Remediation Services",
    notice_id: "OPP-003",
    naics_code: "562910",
    secondary_naics: ["541620"],
    set_aside_code: "8a",
    estimated_value: 3500000
  },
  {
    title: "Network Security Operations Center",
    notice_id: "OPP-004",
    naics_code: "541513",
    secondary_naics: ["541512"],
    set_aside_code: "SB",
    estimated_value: 12000000
  },
  {
    title: "Software Development for Defense Systems",
    notice_id: "OPP-005",
    naics_code: "541511",
    secondary_naics: ["541512"],
    set_aside_code: null,
    estimated_value: 15000000
  },
  {
    title: "IT Systems Integration",
    notice_id: "OPP-006",
    naics_code: "541512",
    secondary_naics: [],
    set_aside_code: "VO",
    estimated_value: 6000000
  },
  {
    title: "Medical Supply Chain Management",
    notice_id: "OPP-007",
    naics_code: "488510",
    secondary_naics: ["493120"],
    set_aside_code: "SB",
    estimated_value: 4500000
  }
];

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
  set_aside_code?: string | null;
  estimated_value?: number;
}

function computeFitScore(company: CompanyFitMetrics, opportunity: OpportunityFitMetrics): FitScoreMetrics {
  const reasoning: string[] = [];

  // 1. NAICS ALIGNMENT (40% weight)
  let naicsScore = 0;
  const companyNAICS = [company.primary_naics, ...company.other_naics];
  const allOpportunityNAICS = [opportunity.naics_code, ...(opportunity.secondary_naics || [])];

  if (company.primary_naics === opportunity.naics_code) {
    naicsScore = 100;
    reasoning.push('✓ Primary NAICS is exact match');
  } else if (opportunity.secondary_naics?.includes(company.primary_naics)) {
    naicsScore = 85;
    reasoning.push('✓ Primary NAICS matches secondary requirement');
  } else if (companyNAICS.some(nc => allOpportunityNAICS.includes(nc))) {
    naicsScore = 75;
    reasoning.push('✓ Secondary NAICS matches opportunity');
  } else if (companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 5) === opp.substring(0, 5))
  )) {
    naicsScore = 60;
    reasoning.push('○ 5-digit NAICS match (industry level)');
  } else if (companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 4) === opp.substring(0, 4))
  )) {
    naicsScore = 45;
    reasoning.push('○ 4-digit NAICS match (industry group)');
  } else if (companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 3) === opp.substring(0, 3))
  )) {
    naicsScore = 30;
    reasoning.push('△ 3-digit NAICS match (subsector)');
  } else if (companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 2) === opp.substring(0, 2))
  )) {
    naicsScore = 15;
    reasoning.push('△ Weak 2-digit NAICS match (sector only)');
  } else {
    reasoning.push('✗ No NAICS alignment detected');
  }

  // 2. SET-ASIDE ELIGIBILITY (30% weight)
  let setAsideScore = 0;
  let eligible = true;

  if (opportunity.set_aside_code) {
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
    setAsideScore = 100;
    reasoning.push('○ Full and open competition (no set-aside)');
  }

  // 3. SIZE/CAPABILITY MATCH (20% weight)
  let sizeScore = 100;

  if (opportunity.estimated_value) {
    const revenueRatio = company.annual_revenue / opportunity.estimated_value;

    if (revenueRatio >= 3) {
      sizeScore = 100;
      reasoning.push('✓ Strong financial capacity');
    } else if (revenueRatio >= 1.5) {
      sizeScore = 80;
      reasoning.push('○ Adequate financial capacity');
    } else if (revenueRatio >= 0.5) {
      sizeScore = 60;
      reasoning.push('△ Moderate capacity - may need partners');
    } else {
      sizeScore = 30;
      reasoning.push('⚠ Limited capacity - JV recommended');
    }
  }

  if (company.employee_count < 50 && opportunity.naics_code.startsWith('54')) {
    reasoning.push('○ Small team may limit delivery scale');
    sizeScore = Math.min(sizeScore, 70);
  }

  // 4. CAPABILITY DEPTH (10% weight)
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
    reasoning.push('△ Limited NAICS portfolio');
  }

  if (opportunity.secondary_naics && opportunity.secondary_naics.length > 0) {
    const secondaryCoverage = opportunity.secondary_naics.filter(sn =>
      companyNAICS.includes(sn)
    ).length / opportunity.secondary_naics.length;

    if (secondaryCoverage >= 0.5) {
      capabilityScore = Math.min(100, capabilityScore + 15);
      reasoning.push('✓ Covers multiple secondary requirements');
    }
  }

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

const chartConfig = {
  fit: {
    label: 'Fit Score',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig;

type ViewMode = 'company' | 'opportunity';

export function DataRadarChart() {
  const [viewMode, setViewMode] = useState<ViewMode>('opportunity');
  const [selectedCompany, setSelectedCompany] = useState(MOCK_COMPANIES[0].name);
  const [selectedOpportunity, setSelectedOpportunity] = useState(MOCK_OPPORTUNITIES[0].notice_id);

  // OPPORTUNITY VIEW: Show which companies fit this opportunity
  if (viewMode === 'opportunity') {
    const opportunity = MOCK_OPPORTUNITIES.find(opp => opp.notice_id === selectedOpportunity);
    if (!opportunity) return null;

    const radarData = MOCK_COMPANIES.map(company => {
      const fit = computeFitScore(company, opportunity);

      return {
        company: company.name.length > 25 ? company.name.substring(0, 25) + '...' : company.name,
        fullName: company.name,
        fit: fit.overallScore,
        naicsScore: fit.naicsScore,
        setAsideScore: fit.setAsideScore,
        sizeScore: fit.sizeScore,
        capabilityScore: fit.capabilityScore,
        eligible: fit.eligible,
        reasoning: fit.reasoning,
        uei: company.uei,
        primaryNaics: company.primary_naics,
        certs: company.sba_certifications,
      };
    }).sort((a, b) => b.fit - a.fit);

    const eligibleCompanies = radarData.filter(c => c.eligible);
    const topCompanies = eligibleCompanies.slice(0, 6);

    return (
      <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm p-8">
        <div className="space-y-6">
          {/* HEADER */}
          <section className="flex items-start justify-between gap-6">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <Users className="size-5 text-primary" />
                <h3 className="text-xl font-normal tracking-tight">Company Fit Analysis</h3>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Find the best companies for this opportunity and identify joint venture partners
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* VIEW MODE TOGGLE */}
              <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
                <TabsList>
                  <TabsTrigger value="opportunity" className="text-xs">
                    <Users className="size-3 mr-1" />
                    Companies
                  </TabsTrigger>
                  <TabsTrigger value="company" className="text-xs">
                    <Target className="size-3 mr-1" />
                    Opportunities
                  </TabsTrigger>
                </TabsList>
              </Tabs>

              {/* OPPORTUNITY DROPDOWN */}
              <Select
                value={selectedOpportunity}
                onValueChange={setSelectedOpportunity}
              >
                <SelectTrigger className="border-border/60 bg-background min-w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_OPPORTUNITIES.map(opp =>
                    <SelectItem key={opp.notice_id} value={opp.notice_id}>
                      <div className="flex items-center gap-2">
                        <Target className="size-4 text-muted-foreground" />
                        <span className="truncate max-w-[200px]">{opp.title}</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </section>

          {/* OPPORTUNITY CARD */}
          <section className="p-4 rounded-lg bg-secondary/30 border border-border/40 space-y-3">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1 flex-1">
                <h4 className="font-normal text-base">{opportunity.title}</h4>
                <p className="text-xs text-muted-foreground">Notice ID: {opportunity.notice_id}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="bg-primary/5 border-primary/25 text-primary text-xs">
                {opportunity.naics_code}
              </Badge>
              {opportunity.secondary_naics?.map(naics =>
                <Badge key={naics} variant="outline" className="bg-secondary border-border/40 text-xs">
                  {naics}
                </Badge>
              )}
              {opportunity.set_aside_code && (
                <Badge variant="outline" className="bg-accent/50 border-accent text-xs">
                  {opportunity.set_aside_code}
                </Badge>
              )}
              {opportunity.estimated_value && (
                <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-xs">
                  ${(opportunity.estimated_value / 1000000).toFixed(1)}M
                </Badge>
              )}
            </div>
          </section>

          {/* RADAR CHART */}
          {topCompanies.length > 0 ? (
            <div className="h-[400px] w-full">
              <ChartContainer config={chartConfig} className="size-full">
                <RadarChart data={topCompanies}>
                  <PolarGrid stroke="var(--muted-foreground)" strokeWidth={1} />
                  <PolarAngleAxis
                    dataKey="company"
                    tick={{ fill: "var(--foreground)", fontSize: 11 }}
                    tickLine={false}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 100]}
                    tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                    tickCount={5}
                  />
                  <Radar
                    dataKey="fit"
                    stroke="var(--chart-1)"
                    fill="var(--chart-1)"
                    fillOpacity={0.3}
                    strokeWidth={2}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        className="bg-card/95 backdrop-blur-sm border-border/15 p-4"
                        formatter={(value, name, props) => {
                          const { payload } = props;
                          return (
                            <div className="w-[280px] space-y-3">
                              <div className="space-y-1">
                                <p className="text-xs font-medium">{payload.fullName}</p>
                                <p className="text-xs text-muted-foreground">
                                  Primary NAICS: <span className="text-foreground">{payload.primaryNaics}</span>
                                </p>
                              </div>
                              
                              <div className="space-y-2 pt-2 border-t border-border/40">
                                <div className="flex justify-between items-center">
                                  <span className="text-xs text-muted-foreground">Overall Fit</span>
                                  <span className="text-sm font-medium text-primary">{payload.fit}%</span>
                                </div>
                                
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">NAICS Match</span>
                                    <span className="text-foreground">{payload.naicsScore}%</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Set-Aside</span>
                                    <span className={payload.eligible ? "text-green-500" : "text-red-500"}>
                                      {payload.setAsideScore}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Size/Capacity</span>
                                    <span className="text-foreground">{payload.sizeScore}%</span>
                                  </div>
                                  <div className="flex justify-between text-xs">
                                    <span className="text-muted-foreground">Capability</span>
                                    <span className="text-foreground">{payload.capabilityScore}%</span>
                                  </div>
                                </div>
                                
                                {payload.reasoning && payload.reasoning.length > 0 && (
                                  <div className="pt-2 border-t border-border/40 space-y-1">
                                    {payload.reasoning.slice(0, 3).map((reason: string, idx: number) => (
                                      <p key={`${payload.uei}-reason-${idx}`} className="text-xs text-muted-foreground leading-relaxed">
                                        {reason}
                                      </p>
                                    ))}
                                  </div>
                                )}
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
          ) : (
            <div className="h-[400px] w-full flex items-center justify-center border border-dashed border-border/40 rounded-lg">
              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">No eligible companies found</p>
                <p className="text-xs text-muted-foreground/70">Set-aside requirements may be too restrictive</p>
              </div>
            </div>
          )}

          {/* TOP COMPANIES */}
          <section className="space-y-3 pt-4 border-t border-border/40">
            <h4 className="text-sm font-normal text-muted-foreground">Top Matching Companies</h4>
            {topCompanies.length > 0 ? (
              <div className="space-y-2">
                {topCompanies.slice(0, 3).map(company =>
                  <div
                    key={company.uei}
                    className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/30 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex-1 space-y-1">
                      <p className="text-sm text-foreground">{company.fullName}</p>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs bg-background">
                          {company.primaryNaics}
                        </Badge>
                        {company.certs.length > 0 && (
                          <span className="text-xs text-muted-foreground">{company.certs.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-normal text-primary">{company.fit}%</span>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No matching companies available</p>
            )}
          </section>
        </div>
      </Card>
    );
  }

  // COMPANY VIEW: Show which opportunities fit this company
  const company = MOCK_COMPANIES.find(co => co.name === selectedCompany);
  if (!company) return null;

  const radarData = MOCK_OPPORTUNITIES.map(opp => {
    const fit = computeFitScore(company, opp);

    return {
      opportunity: opp.title.length > 30 ? opp.title.substring(0, 30) + '...' : opp.title,
      fullTitle: opp.title,
      fit: fit.overallScore,
      naicsScore: fit.naicsScore,
      setAsideScore: fit.setAsideScore,
      sizeScore: fit.sizeScore,
      capabilityScore: fit.capabilityScore,
      eligible: fit.eligible,
      reasoning: fit.reasoning,
      noticeId: opp.notice_id,
      naicsCode: opp.naics_code,
      setAside: opp.set_aside_code,
    };
  }).sort((a, b) => b.fit - a.fit);

  const eligibleOpportunities = radarData.filter(o => o.eligible);
  const topOpportunities = eligibleOpportunities.slice(0, 6);

  return (
    <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm p-8">
      <div className="space-y-6">
        {/* HEADER */}
        <section className="flex items-start justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Target className="size-5 text-primary" />
              <h3 className="text-xl font-normal tracking-tight">Opportunity Fit Analysis</h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Discover which opportunities align best with your company&apos;s capabilities
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* VIEW MODE TOGGLE */}
            <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="opportunity" className="text-xs">
                  <Users className="size-3 mr-1" />
                  Companies
                </TabsTrigger>
                <TabsTrigger value="company" className="text-xs">
                  <Target className="size-3 mr-1" />
                  Opportunities
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {/* COMPANY DROPDOWN */}
            <Select
              value={selectedCompany}
              onValueChange={setSelectedCompany}
            >
              <SelectTrigger className="border-border/60 bg-background min-w-[250px]">
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
            {company.sba_certifications.length > 0 && (
              <Badge variant="outline" className="bg-accent/50 border-accent text-xs">
                {company.sba_certifications.join(', ')}
              </Badge>
            )}
          </div>
        </section>

        {/* RADAR CHART */}
        {topOpportunities.length > 0 ? (
          <div className="h-[400px] w-full">
            <ChartContainer config={chartConfig} className="size-full">
              <RadarChart data={topOpportunities}>
                <PolarGrid stroke="var(--muted-foreground)" strokeWidth={1} />
                <PolarAngleAxis
                  dataKey="opportunity"
                  tick={{ fill: "var(--foreground)", fontSize: 11 }}
                  tickLine={false}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fill: "var(--muted-foreground)", fontSize: 10 }}
                  tickCount={5}
                />
                <Radar
                  dataKey="fit"
                  stroke="var(--chart-1)"
                  fill="var(--chart-1)"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      hideLabel
                      className="bg-card/95 backdrop-blur-sm border-border/15 p-4"
                      formatter={(value, name, props) => {
                        const { payload } = props;
                        return (
                          <div className="w-[280px] space-y-3">
                            <div className="space-y-1">
                              <p className="text-xs font-medium text-balance">{payload.fullTitle}</p>
                              <p className="text-xs text-muted-foreground">
                                NAICS: <span className="text-foreground">{payload.naicsCode}</span>
                              </p>
                            </div>
                            
                            <div className="space-y-2 pt-2 border-t border-border/40">
                              <div className="flex justify-between items-center">
                                <span className="text-xs text-muted-foreground">Overall Fit</span>
                                <span className="text-sm font-medium text-primary">{payload.fit}%</span>
                              </div>
                              
                              <div className="space-y-1">
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">NAICS Match</span>
                                  <span className="text-foreground">{payload.naicsScore}%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Set-Aside</span>
                                  <span className={payload.eligible ? "text-green-500" : "text-red-500"}>
                                    {payload.setAsideScore}%
                                  </span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Size/Capacity</span>
                                  <span className="text-foreground">{payload.sizeScore}%</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                  <span className="text-muted-foreground">Capability</span>
                                  <span className="text-foreground">{payload.capabilityScore}%</span>
                                </div>
                              </div>
                              
                              {payload.reasoning && payload.reasoning.length > 0 && (
                                <div className="pt-2 border-t border-border/40 space-y-1">
                                  {payload.reasoning.slice(0, 3).map((reason: string, idx: number) => (
                                    <p key={`${payload.noticeId}-reason-${idx}`} className="text-xs text-muted-foreground leading-relaxed">
                                      {reason}
                                    </p>
                                  ))}
                                </div>
                              )}
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
        ) : (
          <div className="h-[400px] w-full flex items-center justify-center border border-dashed border-border/40 rounded-lg">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">No eligible opportunities found</p>
              <p className="text-xs text-muted-foreground/70">This company may not meet set-aside requirements</p>
            </div>
          </div>
        )}

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
          {topOpportunities.length > 0 ? (
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
          ) : (
            <p className="text-xs text-muted-foreground italic">No matching opportunities available</p>
          )}
        </section>
      </div>
    </Card>
  );
}
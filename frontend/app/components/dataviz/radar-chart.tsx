import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart } from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Building2, Target, Users } from 'lucide-react';
import { MOCK_COMPANIES, MOCK_OPPORTUNITIES } from '@/lib/db/mock-data';

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
  const companyNAICS = [company.primary_naics, ...company.other_naics];
  const allOpportunityNAICS = [opportunity.naics_code, ...(opportunity.secondary_naics || [])];

  let naicsScore = 0; // NAICS ALIGNMENT (40% weight)
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

  let eligible = true;
  let setAsideScore = 0; // SET-ASIDE ELIGIBILITY (30% weight)
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

  let sizeScore = 100; // SIZE/CAPABILITY MATCH (20% weight)
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

  let capabilityScore = 0; // CAPABILITY DEPTH (10% weight)
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
  fit: { label: 'Fit Score', color: 'var(--chart-1)' },
} satisfies ChartConfig;

type ViewMode = 'company' | 'opportunity';

export function DataRadarChart() {
  const [viewMode, setViewMode] = useState<ViewMode>('opportunity');
  const [selectedCompany, setSelectedCompany] = useState(MOCK_COMPANIES[0].name);
  const [selectedOpportunity, setSelectedOpportunity] = useState(MOCK_OPPORTUNITIES[0].notice_id);

  function computeViewData() {
    // OPPORTUNITY VIEW
    if (viewMode === 'opportunity') {
      const opportunity = MOCK_OPPORTUNITIES.find(opp => opp.notice_id === selectedOpportunity);
      if (!opportunity) return null;

      const scored = MOCK_COMPANIES.map(company => {
        const fit = computeFitScore(company, opportunity);
        return {
          dataKey: company.name.length > 25 ? company.name.substring(0, 25) + '...' : company.name,
          title: company.name,
          ...fit,
          uei: company.uei,
          primaryNaics: company.primary_naics,
          certs: company.sba_certifications,
        };
      }).sort((a, b) => b.overallScore - a.overallScore);
      return {
        entity: opportunity,
        items: scored.filter(s => s.eligible).slice(0, 6),
        type: 'company' as const,
      };
    }

    // COMPANY VIEW
    const company = MOCK_COMPANIES.find(co => co.name === selectedCompany);
    if (!company) return null;
    const scored = MOCK_OPPORTUNITIES.map(opp => {
      const fit = computeFitScore(company, opp);
      return {
        dataKey: opp.title.length > 30 ? opp.title.substring(0, 30) + '...' : opp.title,
        title: opp.title,
        ...fit,
        noticeId: opp.notice_id,
        naicsCode: opp.naics_code,
        setAside: opp.set_aside_code,
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
    return {
      entity: company,
      items: scored.filter(s => s.eligible).slice(0, 6),
      type: 'opportunity' as const,
    };
  }

  const viewData = computeViewData();
  if (!viewData) return null;

  const { entity, items, type } = viewData;
  const isCompanyView = type === 'opportunity';

  return (
    <Card className="border-border/40 shadow-sm bg-card/50 backdrop-blur-sm p-8">
      <div className="space-y-6">
        {/* HEADER */}
        <section className="flex items-start justify-between gap-6">
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              {isCompanyView ?
                <Target className="size-4.5 text-primary/90" /> : <Users className="size-4.5 text-primary/90" />
              }
              <h3 className="text-xl font-soehne tracking-wide">
                {isCompanyView ? 'Opportunity Fit Analysis' : 'Company Fit Analysis'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {isCompanyView
                ? "Discover which opportunities align best with a company's capabilities"
                : "Find the best companies for this opportunity or identify joint venture partners"
              }
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* VIEW TOGGLE */}
            <Tabs value={viewMode} onValueChange={v => setViewMode(v as ViewMode)}>
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

            {/* DROPDOWN MENU */}
            {isCompanyView ? (
              <Select value={selectedCompany} onValueChange={setSelectedCompany}>
                <SelectTrigger className="border-border/60 bg-background w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_COMPANIES.map(co =>
                    <SelectItem key={co.uei} value={co.name}>
                      <div className="flex items-center gap-2">
                        <Building2 className="size-4 text-muted-foreground" />
                        <span>{co.name}</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            ) : (
              <Select value={selectedOpportunity} onValueChange={setSelectedOpportunity}>
                <SelectTrigger className="border-border/60 bg-background w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MOCK_OPPORTUNITIES.map(opp =>
                    <SelectItem key={opp.notice_id} value={opp.notice_id}>
                      <div className="flex items-center gap-2">
                        <Target className="size-4 text-muted-foreground" />
                        <span>{opp.title}</span>
                      </div>
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            )}
          </div>
        </section>

        {/* ENTITY CARD */}
        <section className="p-4 rounded-lg bg-secondary/30 border border-border/40 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h4 className="font-metric text-lg">
                {'name' in entity && entity.name}
                {'title' in entity && entity.title}
              </h4>
              <p className="text-pretty text-[.825rem]/6 text-muted-foreground">
                {'description' in entity && entity.description}
                {'notice_id' in entity && `Notice ID: ${entity.notice_id}`}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {'primary_naics' in entity ? (
              <>
                <Badge variant="outline" className="bg-primary/5 border-primary/25 text-primary text-xs">
                  {entity.primary_naics}
                </Badge>
                {entity.other_naics.slice(0, 3).map(naics =>
                  <Badge key={naics} variant="outline" className="bg-secondary border-border/40 text-xs">{naics}</Badge>
                )}
                {entity.sba_certifications.length > 0 && (
                  <Badge variant="outline" className="bg-accent/50 border-accent text-xs">
                    {entity.sba_certifications.join(', ')}
                  </Badge>
                )}
              </>
            ) : (
              <>
                <Badge variant="outline" className="bg-primary/5 border-primary/25 text-primary text-xs">
                  {entity.naics_code}
                </Badge>
                {entity.secondary_naics?.map(naics =>
                  <Badge key={naics} variant="outline" className="bg-secondary border-border/40 text-xs">{naics}</Badge>
                )}
                {entity.set_aside_code && (
                  <Badge variant="outline" className="bg-accent/50 border-accent text-xs">{entity.set_aside_code}</Badge>
                )}
                {entity.estimated_value && (
                  <Badge variant="outline" className="bg-blue-500/10 border-blue-500/30 text-xs">
                    ${(entity.estimated_value / 1000000).toFixed(1)}M
                  </Badge>
                )}
              </>
            )}
          </div>
        </section>

        {/* RADAR CHART */}
        {items.length > 0
          ? <FitRadarChart data={items.map(item => ({ ...item, fit: item.overallScore }))} dataKey="dataKey" />
          : <EmptyState
            message={isCompanyView ? "No eligible opportunities found" : "No eligible companies found"}
            submessage={isCompanyView ? "This company may not meet set-aside requirements" : "Set-aside requirements may be too restrictive"}
          />
        }
        <FitLegend />

        {/* TOP MATCHES */}
        <section className="space-y-3 pt-4 border-t border-border/40">
          <h4 className="text-sm font-normal text-muted-foreground">
            Top Matching {isCompanyView ? 'Opportunities' : 'Companies'}
          </h4>
          {items.length > 0 ? (
            <div className="space-y-2">
              {items.slice(0, 3).map(item =>
                <div
                  key={'uei' in item ? item.uei : item.noticeId}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/20 border border-border/30 hover:bg-secondary/30 transition-colors"
                >
                  <div className="flex-1 space-y-1">
                    <p className="text-sm text-foreground">{item.title}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-background">
                        {'primaryNaics' in item ? item.primaryNaics : item.naicsCode}
                      </Badge>
                      {'certs' in item && item.certs.length > 0 && (
                        <span className="text-xs text-muted-foreground">{item.certs.join(', ')}</span>
                      )}
                      {'setAside' in item && item.setAside && (
                        <span className="text-xs text-muted-foreground">{item.setAside}</span>
                      )}
                    </div>
                  </div>
                  <span className="text-2xl font-normal text-primary">{item.overallScore}%</span>
                </div>
              )}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No matching {isCompanyView ? 'opportunities' : 'companies'} available
            </p>
          )}
        </section>
      </div>
    </Card>
  );
}

function FitTooltip({ payload }: { payload: any; }) {
  return (
    <div className="w-[280px] space-y-3">
      <div className="space-y-1">
        <p className="text-xs font-medium">{payload.fullName || payload.fullTitle}</p>
        <p className="text-xs text-muted-foreground">
          {payload.primaryNaics ? `Primary NAICS: ${payload.primaryNaics}` : `NAICS: ${payload.naicsCode}`}
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

        {payload.reasoning?.length > 0 && (
          <div className="pt-2 border-t border-border/40 space-y-1">
            {payload.reasoning.slice(0, 3).map((reason: string, idx: number) => (
              <p key={`${payload.uei || payload.noticeId}-reason-${idx}`} className="text-xs text-muted-foreground leading-relaxed">
                {reason}
              </p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FitRadarChart({ data, dataKey }: { data: any[]; dataKey: string; }) {
  return (
    <div className="h-[400px] w-full">
      <ChartContainer config={chartConfig} className="size-full">
        <RadarChart data={data}>
          <PolarGrid stroke="var(--muted-foreground)" strokeWidth={1} />
          <PolarAngleAxis dataKey={dataKey} tick={{ fill: "var(--foreground)", fontSize: 11 }} tickLine={false} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickCount={5} />
          <Radar dataKey="fit" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.3} strokeWidth={2} />
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent hideLabel className="bg-card/95 backdrop-blur-sm border-border/15 p-4" formatter={(_, __, props) => <FitTooltip payload={props.payload} />} />}
          />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}

function EmptyState({ message, submessage }: { message: string; submessage: string; }) {
  return (
    <div className="h-[400px] w-full flex items-center justify-center border border-dashed border-border/40 rounded-lg">
      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">{message}</p>
        <p className="text-xs text-muted-foreground/70">{submessage}</p>
      </div>
    </div>
  );
}

function FitLegend() {
  const items = [
    { color: 'bg-primary', label: '100% - Perfect Match', desc: 'Primary NAICS matches' },
    { color: 'bg-primary/75', label: '75% - Strong Match', desc: 'Any NAICS matches' },
    { color: 'bg-primary/50', label: '50% - Partial Match', desc: 'Industry group match' },
    { color: 'bg-primary/25', label: '25% - Weak Match', desc: 'Sector match only' },
  ];

  return (
    <section className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-border/40">
      {items.map(item => (
        <div key={item.label} className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${item.color}`} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
          <p className="text-xs text-muted-foreground/70 pl-5">{item.desc}</p>
        </div>
      ))}
    </section>
  );
}

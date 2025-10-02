import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Tooltip, Cell
} from 'recharts';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Building2, Target, Users } from 'lucide-react';
import { MOCK_COMPANIES, MOCK_OPPORTUNITIES } from '@/lib/db/mock-data';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

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
    reasoning.push('✓ Primary NAICS alignment');
  } else if (opportunity.secondary_naics?.includes(company.primary_naics)) {
    naicsScore = 85;
    reasoning.push('✓ Primary NAICS matches requirement');
  } else if (companyNAICS.some(nc => allOpportunityNAICS.includes(nc))) {
    naicsScore = 75;
    reasoning.push('✓ Secondary NAICS matches opportunity');
  } else if (companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 5) === opp.substring(0, 5))
  )) {
    naicsScore = 60;
    reasoning.push('○ NAICS industry match (5-digit)');
  } else if (companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 4) === opp.substring(0, 4))
  )) {
    naicsScore = 45;
    reasoning.push('○ Industry group match (4-digit)');
  } else if (companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 3) === opp.substring(0, 3))
  )) {
    naicsScore = 30;
    reasoning.push('△ Subsector match (3-digit)');
  } else if (companyNAICS.some(co =>
    allOpportunityNAICS.some(opp => co.substring(0, 2) === opp.substring(0, 2))
  )) {
    naicsScore = 15;
    reasoning.push('△ Weak sector match (2-digit)');
  } else {
    reasoning.push('✗ No NAICS alignment');
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

type ViewMode = 'company' | 'opportunity';
type ChartMode = 'standard' | 'pivot';
interface ChartData {
  viewMode: ViewMode,
  selectCompanies: string[],
  selectOpportunities: string[],
  selectCompany?: string,
  selectOpportunity?: string,
}
const chartConfig = {
  fit: { label: 'Fit Score', color: 'var(--chart-1)' },
} satisfies ChartConfig;
const METRIC_DEFS = [
  { key: 'naicsScore', label: 'NAICS' },
  { key: 'setAsideScore', label: 'Set-Aside' },
  { key: 'sizeScore', label: 'Size/Capacity' },
  { key: 'capabilityScore', label: 'Capability' },
] as const;

// key: `${companyName}__${noticeId}`
const fitCache = new Map<string, FitScoreMetrics>();
function getFit(companyName: string, noticeId: string) {
  const co = MOCK_COMPANIES.find(c => c.name === companyName);
  const opp = MOCK_OPPORTUNITIES.find(o => o.notice_id === noticeId);
  if (!co || !opp) return null;
  const key = `${companyName}__${noticeId}`;
  if (!fitCache.has(key)) fitCache.set(key, computeFitScore(co, opp));
  return { company: co, opp, metrics: fitCache.get(key)! };
}

function buildPanelData(
  viewMode: ViewMode,
  selectCompany: string,
  selectOpportunity: string,
  selectCompanies: string[],
  selectOpportunities: string[],
) {
  if (viewMode === 'opportunity') {
    const opp = MOCK_OPPORTUNITIES.find(o => o.notice_id === selectOpportunity)
      ?? MOCK_OPPORTUNITIES.find(o => selectOpportunities.includes(o.notice_id));
    if (!opp) return null;

    const items = MOCK_COMPANIES
      .filter(c => selectCompanies.includes(c.name))
      .map(c => {
        const r = getFit(c.name, opp.notice_id)!;
        return {
          dataKey: c.name.length > 25 ? c.name.slice(0, 25) + '...' : c.name,
          title: c.name,
          ...r.metrics,
          uei: c.uei,
          primaryNaics: c.primary_naics,
          certs: c.sba_certifications,
        };
      })
      .filter(i => i.eligible)
      .sort((a, b) => b.overallScore - a.overallScore);

    return { entity: opp, items, type: 'company' as const };
  }

  // viewMode === 'company'
  const co = MOCK_COMPANIES.find(c => c.name === selectCompany)
    ?? MOCK_COMPANIES.find(c => selectCompanies.includes(c.name));
  if (!co) return null;

  const items = MOCK_OPPORTUNITIES
    .filter(o => selectOpportunities.includes(o.notice_id))
    .map(o => {
      const r = getFit(co.name, o.notice_id)!;
      return {
        dataKey: o.title.length > 25 ? o.title.slice(0, 25) + '...' : o.title,
        title: o.title,
        ...r.metrics,
        noticeId: o.notice_id,
        naicsCode: o.naics_code,
        setAside: o.set_aside_code,
      };
    })
    .filter(i => i.eligible)
    .sort((a, b) => b.overallScore - a.overallScore);

  return { entity: co, items, type: 'opportunity' as const };
}

function buildStandardData({ viewMode, selectCompanies, selectOpportunities }: ChartData) {
  const companies = MOCK_COMPANIES.filter(c => selectCompanies.includes(c.name));
  const opportunities = MOCK_OPPORTUNITIES.filter(o => selectOpportunities.includes(o.notice_id));

  if (viewMode === 'opportunity') {
    return {
      rows: opportunities.map(opp => {
        const row: Record<string, any> = {
          category: opp.title.length > 30 ? opp.title.slice(0, 30) + '...' : opp.title,
          fullTitle: opp.title,
        };
        for (const co of companies) row[co.name] = computeFitScore(co, opp).overallScore;
        return row;
      }),
      series: companies.map(c => c.name),
      categoryKey: 'category' as const,
    };
  }

  return {
    rows: companies.map(co => {
      const row: Record<string, any> = { category: co.name, fullTitle: co.name };
      for (const opp of opportunities) row[opp.title] = computeFitScore(co, opp).overallScore;
      return row;
    }),
    series: opportunities.map(o => o.title),
    categoryKey: 'category' as const,
  };
}

function buildPivotData({ viewMode, selectCompanies, selectOpportunities, selectCompany, selectOpportunity }: ChartData) {
  const companies = MOCK_COMPANIES.filter(c => selectCompanies.includes(c.name));
  const opportunities = MOCK_OPPORTUNITIES.filter(o => selectOpportunities.includes(o.notice_id));
  // 'opportunity' view => compare companies (series) against select opportunity
  // 'company' view => compare opportunities (series) against select company
  if (viewMode === 'opportunity') {
    const anchor = MOCK_OPPORTUNITIES.find(o => o.notice_id === selectOpportunity) || opportunities[0];
    if (!anchor) return { rows: [] as any[], series: [] as string[] };

    const series = companies.map(c => c.name);
    const rows = METRIC_DEFS.map(m => {
      const row: Record<string, any> = { metric: m.label };
      for (const c of companies) row[c.name] = computeFitScore(c, anchor)[m.key];
      return row;
    });
    return { rows, series };
  }

  const anchor = MOCK_COMPANIES.find(c => c.name === selectCompany) || MOCK_COMPANIES[0];
  const series = opportunities.map(o => o.title);
  const rows = METRIC_DEFS.map(m => {
    const row: Record<string, any> = { metric: m.label };
    for (const o of opportunities) row[o.title] = computeFitScore(anchor, o)[m.key];
    return row;
  });
  return { rows, series };
}


export function DataRadarChart() {
  const [chartMode, setChartMode] = useState<ChartMode>('standard');
  const [viewMode, setViewMode] = useState<ViewMode>('opportunity');
  const [selectCompanies, setSelectCompanies] = useState([MOCK_COMPANIES[0].name]);
  const [selectOpportunities, setSelectOpportunities] = useState(MOCK_OPPORTUNITIES.map(o => o.notice_id).slice(0, 4));

  const [selectCompany, setSelectCompany] = useState(MOCK_COMPANIES[0].name);
  const [selectOpportunity, setSelectOpportunity] = useState(MOCK_OPPORTUNITIES[0].notice_id);

  function toggleCompany(name: string) {
    setSelectCompanies(prev => prev.includes(name)
      ? prev.filter(id => id !== name)
      : [...prev, name]
    );
  }
  function toggleOpportunity(noticeId: string) {
    setSelectOpportunities(prev => prev.includes(noticeId)
      ? prev.filter((id) => id !== noticeId)
      : [...prev, noticeId]
    );
  }

  const standardData = buildStandardData({ viewMode, selectCompanies, selectOpportunities });
  const pivotData = buildPivotData({ viewMode, selectCompany, selectOpportunity, selectCompanies, selectOpportunities });

  const buildBarDetails = (seriesLabel: string, row: any) => {
    if (viewMode === 'opportunity') {
      // series = company, category row = opportunity
      const company = MOCK_COMPANIES.find(c => c.name === seriesLabel);
      const oppTitle = row.fullTitle ?? row[standardData.categoryKey];
      const opp = MOCK_OPPORTUNITIES.find(o => o.title === oppTitle);
      if (!company || !opp) return null;
      const metrics = computeFitScore(company, opp);
      return {
        fullTitle: opp.title,
        primaryNaics: company.primary_naics,
        naicsCode: opp.naics_code,
        metrics,
      };
    } else {
      // series = opportunity, category row = company
      const companyName = row.fullTitle ?? row[standardData.categoryKey];
      const company = MOCK_COMPANIES.find(c => c.name === companyName);
      const opp = MOCK_OPPORTUNITIES.find(o => o.title === seriesLabel);
      if (!company || !opp) return null;
      const metrics = computeFitScore(company, opp);
      return {
        fullTitle: opp.title,
        primaryNaics: company.primary_naics,
        naicsCode: opp.naics_code,
        metrics,
      };
    }
  };

  function renderChart(isCompanyView: boolean) {
    const companyCount = selectCompanies.length;
    const opportunityCount = selectOpportunities.length;

    if (companyCount === 0 || opportunityCount === 0) {
      return (
        <div className="h-[400px] w-full flex items-center justify-center border border-dashed border-border/40 rounded-lg">
          <p className="text-sm text-muted-foreground">
            Select at least one company and one opportunity to compare
          </p>
        </div>
      );
    }

    // one-to-one standard -> pivoted radar (metrics as axes)
    const isOneToOne = companyCount === 1 && opportunityCount === 1;

    if (chartMode === 'pivot' || isOneToOne) {
      if (!pivotData.rows.length || !pivotData.series.length) {
        return (
          <div className="h-[400px] w-full flex items-center justify-center border border-dashed border-border/40 rounded-lg">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Pick at least one company and one opportunity
              </p>
              <p className="text-xs text-muted-foreground/70">
                Metrics view compares NAICS / Set-Aside / Size / Capability
              </p>
            </div>
          </div>
        );
      }
      return <PivotRadar rows={pivotData.rows} series={pivotData.series} />;
    }

    const seriesCount = standardData.series.length;

    if (!standardData.rows.length) {
      return (
        <div className="h-[400px] w-full flex items-center justify-center border border-dashed border-border/40 rounded-lg">
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              {isCompanyView ? 'No eligible opportunities found' : 'No eligible companies found'}
            </p>
            <p className="text-xs text-muted-foreground/70">
              {isCompanyView ? 'This company may not meet set-aside requirements' : 'Set-aside requirements may be too restrictive'}
            </p>
          </div>
        </div>
      );
    }

    if (seriesCount <= 2) {
      return <StackedBars rows={standardData.rows} series={standardData.series} categoryKey={standardData.categoryKey} buildDetailFn={buildBarDetails} />;
    }

    return <StandardRadar rows={standardData.rows} series={standardData.series} categoryKey={standardData.categoryKey} />;
  }

  function computeViewData() {
    // OPPORTUNITY VIEW
    if (viewMode === 'opportunity') {
      const opportunity = MOCK_OPPORTUNITIES.find(opp => opp.notice_id === selectOpportunity);
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
        items: scored.filter(s => s.eligible),
        type: 'company' as const,
      };
    }

    // COMPANY VIEW
    const company = MOCK_COMPANIES.find(co => co.name === selectCompany);
    if (!company) return null;
    const scored = MOCK_OPPORTUNITIES.map(opp => {
      const fit = computeFitScore(company, opp);
      return {
        dataKey: opp.title.length > 25 ? opp.title.substring(0, 25) + '...' : opp.title,
        title: opp.title,
        ...fit,
        noticeId: opp.notice_id,
        naicsCode: opp.naics_code,
        setAside: opp.set_aside_code,
      };
    }).sort((a, b) => b.overallScore - a.overallScore);
    return {
      entity: company,
      items: scored.filter(s => s.eligible),
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
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              {isCompanyView
                ? <Target className="size-5 text-primary/90" />
                : <Users className="size-5 text-primary/90" />
              }
              <h3 className="font-soehne text-xl tracking-wide">
                {isCompanyView
                  ? 'Opportunity Fit Analysis'
                  : 'Company Fit Analysis'
                }
              </h3>
            </div>
            {/* VIEW TOGGLE */}
            <Tabs value={viewMode} onValueChange={v => setViewMode(v as ViewMode)}>
              <TabsList>
                <TabsTrigger value="opportunity" className="text-xs">
                  <Users className="size-3.5 mr-1" />
                  Companies
                </TabsTrigger>
                <TabsTrigger value="company" className="text-xs">
                  <Target className="size-3.5 mr-1" />
                  Opportunities
                </TabsTrigger>
              </TabsList>
            </Tabs>
            {isCompanyView ? (
              <p className="text-sm text-muted-foreground">
                Comparing {selectOpportunities.length} {selectOpportunities.length === 1 ? "opportunity" : "opportunities"} across{" "}
                {selectCompanies.length} {selectCompanies.length === 1 ? "company" : "companies"}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                Comparing {selectCompanies.length} {selectCompanies.length === 1 ? "company" : "companies"} across{" "}
                {selectOpportunities.length} {selectOpportunities.length === 1 ? "opportunity" : "opportunities"}
              </p>
            )
            }
          </div>

          <div className="flex items-center gap-3">
            {/* PIVOT TOGGLE */}
            <Tabs value={chartMode} onValueChange={v => setChartMode(v as ChartMode)}>
              <TabsList>
                <TabsTrigger value="standard" className="text-xs">Standard</TabsTrigger>
                <TabsTrigger value="pivot" className="text-xs">Metrics</TabsTrigger>
              </TabsList>
            </Tabs>
            {/* MULTI-SELECT */}
            <CompanySelector select={selectCompanies} onToggle={toggleCompany} />
            <OpportunitySelector select={selectOpportunities} onToggle={toggleOpportunity} />
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
        {renderChart(isCompanyView)}
        {/* <FitLegend /> */}

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
            {payload.reasoning.map((reason: string, idx: number) =>
              <p
                key={`${payload.uei || payload.noticeId}-reason-${idx}`}
                className="text-xs text-muted-foreground leading-relaxed"
              >
                {reason}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const CHART_COLORS = [
  'oklch(0.55 0.15 264)', // primary blue
  'oklch(0.65 0.15 330)', // purple
  'oklch(0.60 0.15 150)', // green
  'oklch(0.65 0.15 60)',  // yellow
  'oklch(0.60 0.15 30)',  // orange
  'oklch(0.60 0.15 0)',   // red
  'oklch(0.55 0.15 210)', // cyan
  'oklch(0.65 0.15 300)', // magenta
];

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
            content={
              <ChartTooltipContent hideLabel className="bg-card/95 backdrop-blur-sm border-border/15 p-4"
                formatter={(_, __, props) => <FitTooltip payload={props.payload} />}
              />
            }
          />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}

function StandardRadar({ rows, series, categoryKey }: { rows: any[]; series: string[]; categoryKey: string; }) {
  return (
    <div className="h-[400px] w-full">
      <ChartContainer config={chartConfig} className="size-full">
        <RadarChart data={rows}>
          <PolarGrid stroke="var(--muted-foreground)" strokeWidth={1} />
          <PolarAngleAxis dataKey={categoryKey} tick={{ fill: "var(--foreground)", fontSize: 11 }} tickLine={false} />
          {/* <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickCount={6} /> */}
          {series.map((name, idx) => (
            <Radar key={name} name={name} dataKey={name}
              stroke={CHART_COLORS[idx % CHART_COLORS.length]}
              fill={CHART_COLORS[idx % CHART_COLORS.length]}
              fillOpacity={0.2} strokeWidth={2} />
          ))}
          <ChartTooltip
            cursor={false}
            content={<ChartTooltipContent />}
          />
          <Legend wrapperStyle={{ paddingTop: 12 }} iconType="circle"
            formatter={item => <span className="text-xs text-muted-foreground">{item}</span>} />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}

function PivotRadar({ rows, series }: { rows: any[]; series: string[]; }) {
  return (
    <div className="h-[400px] w-full">
      <ChartContainer config={chartConfig} className="size-full">
        <RadarChart data={rows}>
          <PolarGrid stroke="var(--muted-foreground)" strokeWidth={1} />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--foreground)", fontSize: 11 }} tickLine={false} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickCount={6} />
          {series.map((name, idx) => (
            <Radar key={name} name={name} dataKey={name}
              stroke={CHART_COLORS[idx % CHART_COLORS.length]}
              fill={CHART_COLORS[idx % CHART_COLORS.length]}
              fillOpacity={0.2} strokeWidth={2} />
          ))}
          <Tooltip content={<ChartTooltipContent />} />
          <Legend wrapperStyle={{ paddingTop: 12 }} iconType="circle"
            formatter={item => <span className="text-xs text-muted-foreground">{item}</span>} />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}

interface StackedBarsProps {
  rows: any[];
  series: string[];
  categoryKey: string;
  hoverOpacity?: number;
  buildDetailFn?: (seriesLabel: string, row: any) => null | {
    fullTitle?: string;
    primaryNaics?: string;
    naicsCode?: string;
    metrics: FitScoreMetrics;
  };
}
function StackedBars({ rows, series, categoryKey, hoverOpacity = 0.5, buildDetailFn }: StackedBarsProps) {
  const meta = series.map((label, i) => ({
    label,
    key: `s${i + 1}`,  // safe key for --color-*
    colorVar: `var(--chart-${(i % 8) + 1})`,
  }));

  const config = Object.fromEntries(
    meta.map(m => [m.key, { label: m.label, color: m.colorVar }]),
  ) as ChartConfig;

  // normalize rows + attach per-series cell details for tooltip
  const chartData = rows.map(r => {
    const safe = Object.fromEntries(
      meta.map(m => [m.key, Number(r[m.label] ?? r[m.key] ?? 0)]),
    );
    const detail = Object.fromEntries(
      meta.map(m => [m.key, buildDetailFn ? buildDetailFn(m.label, r) : null]),
    );
    return {
      [categoryKey]: r[categoryKey],
      fullTitle: r.fullTitle,
      __detail: detail,
      ...safe,
    };
  });

  // per-series min/max for alpha gradient (0.25 -> 0.90)
  const minMax = Object.fromEntries(
    meta.map(m => {
      const vals = chartData.map(d => Number(d[m.key] ?? 0));
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      return [m.key, { min, max }];
    }),
  ) as Record<string, { min: number; max: number; }>;

  const alpha = (key: string, v: number) => {
    const { min, max } = minMax[key];
    const t = max === min ? 1 : (v - min) / (max - min);
    return 0.25 + t * 0.65;
  };

  function getRadius(meta: Record<string, string>, idx: number) {
    const R = {
      ALL: [4, 4, 4, 4],
      TOP: [4, 4, 0, 0],
      BOTTOM: [0, 0, 4, 4],
      MID: [0, 0, 0, 0],
    } as Record<string, [number, number, number, number]>;
    let radius: [number, number, number, number] = [0, 0, 0, 0];
    if (meta.key.length === 1) radius = R.ALL;
    else if (idx === 0) radius = R.BOTTOM;
    else if (idx === meta.key.length - 1) radius = R.TOP;
    else radius = R.MID;

    return radius;
  }

  return (
    <div className="h-[400px] w-full">
      <ChartContainer config={config} className="size-full">
        <BarChart accessibilityLayer data={chartData}>
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey={categoryKey}
            tickLine={false}
            tickMargin={10}
            axisLine={false}
            tickFormatter={(v: string) => (typeof v === 'string' ? (v.length > 24 ? v.slice(0, 24) + '…' : v) : v)}
          />
          {/* uncomment to clamp to [0,100] explicitly or another range */}
          <YAxis domain={[0, 100]} hide />
          <ChartTooltip
            cursor={{ fill: "var(--foreground)", opacity: hoverOpacity }}
            content={
              <ChartTooltipContent
                hideLabel
                className="bg-card/80 backdrop-blur-sm border-border/30"
              />
            }
          />

          <ChartLegend content={<ChartLegendContent />} />

          {meta.map((m, idx) => (
            <Bar
              key={m.key}
              dataKey={m.key}
              stackId="a"
              fill={`var(--color-${m.key})`}
              radius={getRadius(m, idx)}
            >
              {chartData.map((row, idx) => (
                <Cell key={`${m.key}-${idx}`} fillOpacity={alpha(m.key, Number(row[m.key] ?? 0))} />
              ))}
            </Bar>
          ))}
        </BarChart>
      </ChartContainer>
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
      {items.map(item =>
        <div key={item.label} className="space-y-1">
          <div className="flex items-center gap-2">
            <div className={`size-3 rounded-full ${item.color}`} />
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
          <p className="text-xs text-muted-foreground/70 pl-5">{item.desc}</p>
        </div>
      )}
    </section>
  );
}

function CompanySelector({ select, onToggle }: { select: string[]; onToggle: (name: string) => void; }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-border/60 bg-background">
          <Building2 className="size-4 mr-2" />
          Companies ({select.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Select Companies</h4>
          <div className="space-y-2">
            {MOCK_COMPANIES.map((c) => (
              <div key={c.name} className="flex items-start gap-2">
                <Checkbox id={c.name} checked={select.includes(c.name)} onCheckedChange={() => onToggle(c.name)} />
                <Label htmlFor={c.name} className="text-xs cursor-pointer">{c.name}</Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

function OpportunitySelector({ select, onToggle }: { select: string[]; onToggle: (id: string) => void; }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-border/60 bg-background">
          <Target className="size-4 mr-2" />
          Opportunities ({select.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto" align="end">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Select Opportunities</h4>
          <div className="space-y-2">
            {MOCK_OPPORTUNITIES.map((o) => (
              <div key={o.notice_id} className="flex items-start gap-2">
                <Checkbox id={o.notice_id} checked={select.includes(o.notice_id)} onCheckedChange={() => onToggle(o.notice_id)} />
                <Label htmlFor={o.notice_id} className="text-xs cursor-pointer">{o.title}</Label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

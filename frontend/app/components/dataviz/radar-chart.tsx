import { useLayoutEffect, useRef, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, RadarChart,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend, Cell
} from 'recharts';
import { ChartConfig, ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Building2, Plus, Target, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { MOCK_COMPANIES as mockComps, EXTENDED_MOCK_COMPANIES } from '@/lib/db/mock/companies';
import { MOCK_OPPORTUNITIES as mockOpps, EXTENDED_MOCK_OPPORTUNITIES } from '@/lib/db/mock/opportunities';
import { computeFitScore, FitScoreMetrics, OpportunityFitMetrics, CompanyFitMetrics, Reason } from '@/utils';
import { TooltipTrigger, Tooltip, TooltipContent } from '@/components/ui/tooltip';
import { FitTooltip } from '@/components/dataviz/fit-tooltip';
import { cn } from '@/lib/utils';
import { EntityAccordion, type Entity } from '@/components/dataviz/entity-accordion';

const MOCK_COMPANIES = [...mockComps, ...EXTENDED_MOCK_COMPANIES];
const MOCK_OPPORTUNITIES = [...mockOpps, ...EXTENDED_MOCK_OPPORTUNITIES];

export type ChartViewMode = 'company' | 'opportunity';
export type ChartMode = 'standard' | 'pivot';

export type CompareOptions = {
  view: ChartViewMode;
  companies: string[];
  opportunities: string[];
  mode?: ChartMode;
  anchorCompany?: string;     // 'company' view
  anchorOpportunity?: string; // 'opportunity' view
};

export type ChartHandle = {
  setCompare: (opts: CompareOptions) => void;
  scrollIntoView: () => void;
};

type DataRadarChartProps = {
  initial?: {
    view?: ChartViewMode;
    mode?: ChartMode;
    companies?: string[];
    opportunities?: string[];
    anchorCompany?: string;
    anchorOpportunity?: string;
  };
  ref?: React.RefObject<ChartHandle | null>;
};


interface ChartData {
  viewMode: ChartViewMode,
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

function buildStandardData({ viewMode, selectCompanies, selectOpportunities }: ChartData) {
  const companies = MOCK_COMPANIES.filter(c => selectCompanies.includes(c.name));
  const opportunities = MOCK_OPPORTUNITIES.filter(o => selectOpportunities.includes(o.notice_id));

  if (viewMode === 'opportunity') {
    return {
      rows: opportunities.map(opp => {
        const row: Record<string, any> = {
          category: opp.title.length > 30 ? opp.title.slice(0, 30) + '...' : opp.title,
          fullTitle: opp.title,
          __detail: {} as Record<string, any>,
        };
        for (const co of companies) {
          const metrics = computeFitScore(co, opp);
          row[co.name] = metrics.overallScore;
          row.__detail[co.name] = {
            fullTitle: opp.title,
            primaryNaics: co.primary_naics,
            naicsCode: opp.naics_code,
            ...metrics,
          };
        }
        return row;
      }),
      series: companies.map(c => c.name),
      categoryKey: 'category' as const,
    };
  }

  return {
    rows: companies.map(co => {
      const row: Record<string, any> = {
        category: co.name,
        fullTitle: co.name,
        __detail: {} as Record<string, any>,
      };
      for (const opp of opportunities) {
        const metrics = computeFitScore(co, opp);
        row[opp.title] = metrics.overallScore;
        row.__detail[opp.title] = {
          fullTitle: opp.title,
          primaryNaics: co.primary_naics,
          naicsCode: opp.naics_code,
          ...metrics,
        };
      }
      return row;
    }),
    series: opportunities.map(o => o.title),
    categoryKey: 'category' as const,
  };
}

function buildPivotData({ viewMode, selectCompanies, selectOpportunities, selectCompany, selectOpportunity }: ChartData) {
  const companies = MOCK_COMPANIES.filter(c => selectCompanies.includes(c.name));
  const opportunities = MOCK_OPPORTUNITIES.filter(o => selectOpportunities.includes(o.notice_id));
  // (viewMode === 'opportunity') => compare companies (series) against select opportunity
  if (viewMode === 'opportunity') {
    const anchor = MOCK_OPPORTUNITIES.find(o => o.notice_id === selectOpportunity) || opportunities[0];
    if (!anchor) return { rows: [] as any[], series: [] as string[] };

    const series = companies.map(c => c.name);

    const detailBySeries = Object.fromEntries(
      companies.map(c => {
        const metrics = computeFitScore(c, anchor);
        return [c.name, {
          fullTitle: anchor.title,
          primaryNaics: c.primary_naics,
          naicsCode: anchor.naics_code,
          ...metrics,
        }];
      }),
    );
    const rows = METRIC_DEFS.map(m => {
      const row: Record<string, any> = {
        metric: m.label,
        __detail: detailBySeries
      };
      for (const c of companies) row[c.name] = (detailBySeries[c.name] as any)[m.key];
      return row;
    });
    return { rows, series };
  }

  // (viewMode === 'company') => compare opportunities (series) against select company
  const anchor = MOCK_COMPANIES.find(c => c.name === selectCompany) || MOCK_COMPANIES[0];
  const series = opportunities.map(o => o.title);

  const detailBySeries = Object.fromEntries(
    opportunities.map(o => {
      const metrics = computeFitScore(anchor, o);
      return [o.title, {
        fullTitle: o.title,
        primaryNaics: anchor.primary_naics,
        naicsCode: o.naics_code,
        ...metrics,
      }];
    }),
  );
  const rows = METRIC_DEFS.map(m => {
    const row: Record<string, any> = { metric: m.label, __detail: detailBySeries };
    for (const o of opportunities) row[o.title] = (detailBySeries[o.title] as any)[m.key];
    return row;
  });
  return { rows, series };
}


export function DataRadarChart({ initial, ref }: DataRadarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  const [chartMode, setChartMode] = useState<ChartMode>(initial?.mode ?? 'standard');
  const [viewMode, setViewMode] = useState<ChartViewMode>(initial?.view ?? 'opportunity');

  const [selectCompanies, setSelectCompanies] = useState(initial?.companies ?? [MOCK_COMPANIES[0].name]);
  const [selectOpportunities, setSelectOpportunities] = useState(initial?.opportunities ?? MOCK_OPPORTUNITIES.map(o => o.notice_id).slice(0, 4));

  const [selectCompany, setSelectCompany] = useState(initial?.anchorCompany ?? MOCK_COMPANIES[0].name);
  const [selectOpportunity, setSelectOpportunity] = useState(initial?.anchorOpportunity ?? MOCK_OPPORTUNITIES[0].notice_id);

  useLayoutEffect(() => {
    if (!ref) return;
    ref.current = {
      setCompare: ({ view, mode, companies, opportunities, anchorCompany, anchorOpportunity }) => {
        if (view) setViewMode(view);
        if (mode) setChartMode(mode);
        if (companies) setSelectCompanies(companies);
        if (opportunities) setSelectOpportunities(opportunities);
        if (anchorCompany) setSelectCompany(anchorCompany);
        if (anchorOpportunity) setSelectOpportunity(anchorOpportunity);
      },
      scrollIntoView: () => {
        containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      },
    };
    return () => { ref.current = null; };
  }, [ref]);

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
    const noSelection = companyCount === 0 || opportunityCount === 0;

    if (noSelection) {
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
      const pivotSeriesCount = pivotData.series.length;
      const pivotRowCount = pivotData.rows.length; // METRIC_DEFS currently has length of 4
      const canUsePivotRadar = pivotSeriesCount > 0 && pivotRowCount > 2;

      if (!canUsePivotRadar) {
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

    const standardSeriesCount = standardData.series.length;
    const standardRowCount = standardData.rows.length;

    // radar needs at least 3 axes + 1 series to prevent polygon collapse
    const allowRadar = standardRowCount > 2 && standardSeriesCount > 0;

    if (!standardRowCount) {
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
    // use bars when axes < 3
    if (!allowRadar) {
      return <StackedBars rows={standardData.rows} series={standardData.series} categoryKey={standardData.categoryKey} buildDetailFn={buildBarDetails} />;
    }
    return <StandardRadar rows={standardData.rows} series={standardData.series} categoryKey={standardData.categoryKey} />;
  }

  const entity = viewMode === 'opportunity'
    // prefer the explicitly chosen one; otherwise first in current multiselect
    ? (MOCK_OPPORTUNITIES.find(o => o.notice_id === selectOpportunity)
      ?? MOCK_OPPORTUNITIES.find(o => selectOpportunities.includes(o.notice_id))
      ?? MOCK_OPPORTUNITIES[0])
    : (MOCK_COMPANIES.find(c => c.name === selectCompany)
      ?? MOCK_COMPANIES.find(c => selectCompanies.includes(c.name))
      ?? MOCK_COMPANIES[0]);

  const topMatches = viewMode === 'opportunity'
    ? MOCK_COMPANIES
      .filter(c => selectCompanies.includes(c.name))
      .map(c => {
        const fit = computeFitScore(c, entity as OpportunityFitMetrics);
        return {
          title: c.name,
          dataKey: c.name.length > 25 ? c.name.slice(0, 25) + '…' : c.name,
          uei: c.uei,
          primaryNaics: c.primary_naics,
          certs: c.sba_certifications,
          ...fit,
        };
      })
      .filter(x => x.eligible)
      .sort((a, b) => b.overallScore - a.overallScore)
    : MOCK_OPPORTUNITIES
      .filter(o => selectOpportunities.includes(o.notice_id))
      .map(o => {
        const fit = computeFitScore(entity as CompanyFitMetrics, o);
        return {
          title: o.title,
          dataKey: o.title.length > 25 ? o.title.slice(0, 25) + '…' : o.title,
          noticeId: o.notice_id,
          naicsCode: o.naics_code,
          setAside: o.set_aside_code,
          ...fit,
        };
      })
      .filter(x => x.eligible)
      .sort((a, b) => b.overallScore - a.overallScore);

  const isCompanyView = viewMode === 'company';

  const entities: Entity[] = isCompanyView
    ? MOCK_OPPORTUNITIES.filter(o => selectOpportunities.includes(o.notice_id))
    : MOCK_COMPANIES.filter(c => selectCompanies.includes(c.name));

  if (isCompanyView) {
    const anchor = MOCK_OPPORTUNITIES.find(o => o.notice_id === selectOpportunity);
    if (anchor) {
      const i = entities.findIndex(e => 'notice_id' in e && e.notice_id === anchor.notice_id);
      if (i > 0) entities.unshift(...entities.splice(i, 1));
    }
  } else {
    const anchor = MOCK_COMPANIES.find(c => c.name === selectCompany);
    if (anchor) {
      const i = entities.findIndex(e => 'name' in e && e.name === anchor.name);
      if (i > 0) entities.unshift(...entities.splice(i, 1));
    }
  }

  return (
    <Card ref={containerRef} className="border-border/20 shadow-sm bg-card/50 backdrop-blur-sm p-8">
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
            <Tabs value={viewMode} onValueChange={v => setViewMode(v as ChartViewMode)}>
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
            {isCompanyView
              ? (<p className="text-sm text-muted-foreground">
                Comparing {selectOpportunities.length} {selectOpportunities.length === 1 ? "opportunity" : "opportunities"} across{" "}
                {selectCompanies.length} {selectCompanies.length === 1 ? "company" : "companies"}
              </p>)
              : (<p className="text-sm text-muted-foreground">
                Comparing {selectCompanies.length} {selectCompanies.length === 1 ? "company" : "companies"} across{" "}
                {selectOpportunities.length} {selectOpportunities.length === 1 ? "opportunity" : "opportunities"}
              </p>)
            }
          </div>

          <div className="items-center space-x-1 space-y-1">
            {/* MULTI-SELECT */}
            <CompanySelector select={selectCompanies} onToggle={toggleCompany} />
            <OpportunitySelector select={selectOpportunities} onToggle={toggleOpportunity} />
            <div className="flex justify-end">
              {/* PIVOT TOGGLE */}
              <Tabs value={chartMode} onValueChange={v => setChartMode(v as ChartMode)}>
                <TabsList>
                  <TabsTrigger value="standard" className="text-xs">Standard</TabsTrigger>
                  <TabsTrigger value="pivot" className="text-xs">Metrics</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </section>

        {/* ENTITY ACCORDION */}
        <section className="space-y-3">
          {entities.length ? (
            <EntityAccordion
              entities={entities}
              defaultOpenIndex={0}
              maxOtherNaics={3}
              className="rounded-lg border border-border/20 bg-secondary/30"
            />
          ) : (
            <div className="p-4 rounded-lg border border-dashed border-border/40">
              <p className="text-sm text-muted-foreground">
                Select {isCompanyView ? 'opportunities' : 'companies'} to see summaries.
              </p>
            </div>
          )}
        </section>

        {/* RADAR CHART */}
        {renderChart(isCompanyView)}

        {/* TOP MATCHES */}
        <section className="space-y-3 pt-4 border-t border-border/40">
          <h4 className="text-sm font-normal text-muted-foreground">
            Top Matching {isCompanyView ? 'Opportunities' : 'Companies'}
          </h4>
          {topMatches.length > 0 ? (
            <div className="space-y-2">
              {topMatches.slice(0, 5).map(item =>
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

function StandardRadar({ rows, series, categoryKey }: { rows: any[]; series: string[]; categoryKey: string; }) {
  const [hoverSeries, setHoverSeries] = useState<string | null>(null);
  const colorBySeries = Object.fromEntries(series.map((name, idx) => [name, CHART_COLORS[idx % CHART_COLORS.length]]));
  const legendRow = rows[0];

  const buildLegendTip = (seriesName: string) => legendRow
    ? ({
      active: true,
      payload: [{ payload: legendRow, dataKey: seriesName }],
      coordinate: { x: 0, y: 0 },
    })
    : undefined;

  return (
    <div className="h-[400px] w-full">
      <ChartContainer config={chartConfig} className="size-full">
        <RadarChart data={rows}>
          <PolarGrid stroke="var(--muted-foreground)" strokeWidth={1} />
          <PolarAngleAxis dataKey={categoryKey} tick={{ fill: "var(--foreground)", fontSize: 11 }} tickLine={false} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", opacity: 0.8, fontSize: 9 }} tickCount={6} />
          {series.map((name, idx) => {
            const color = colorBySeries[name];
            const faded = hoverSeries && hoverSeries !== name;
            return (
              <Radar
                key={idx}
                name={name}
                dataKey={name}
                stroke={color}
                fill={color}
                strokeOpacity={faded ? 0.35 : 1}
                fillOpacity={faded ? 0.08 : 0.22}
                strokeWidth={faded ? 1.5 : 2.5}
                onMouseEnter={() => setHoverSeries(name)} // lock to hovered polygon
                onMouseLeave={() => setHoverSeries(null)}
                isAnimationActive={false} // might improve pointer fidelity?
              />
            );
          })}
          <ChartTooltip
            cursor={false}
            content={p => <FitTooltip {...p} selectedSeries={hoverSeries ?? undefined} colorBySeries={colorBySeries} />}
          />
          <Legend
            iconType="rect"
            formatter={series => {
              const tipProps = buildLegendTip(series);
              return (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className={cn(
                      'text-sm font-metric pr-2 align-middle',
                      (hoverSeries && hoverSeries !== series) ? 'text-muted-foreground' : `text-[${colorBySeries[series]}]`
                    )}
                      onMouseEnter={() => setHoverSeries(series)} // hovering legend also locks selection
                      onMouseLeave={() => setHoverSeries(null)}
                    >
                      {series}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="p-0">
                    {tipProps && (
                      <FitTooltip {...tipProps} selectedSeries={series} colorBySeries={colorBySeries} />
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }
            }
          />
        </RadarChart>
      </ChartContainer>
    </div>
  );
}

function PivotRadar({ rows, series }: { rows: any[]; series: string[]; }) {
  const [hoverSeries, setHoverSeries] = useState<string | null>(null);
  const [legendHover, setLegendHover] = useState<string | null>(null);

  // same color assignment approach as StandardRadar
  const colorBySeries: Record<string, string> = Object.fromEntries(
    series.map((name, idx) => [name, CHART_COLORS[idx % CHART_COLORS.length]])
  );

  // use the first metric row for legend tooltips (works well for pivot)
  const legendRow = rows?.[0];

  const buildLegendTip = (seriesName: string) => legendRow
    ? {
      active: true,
      payload: [{ payload: legendRow, dataKey: seriesName }],
      coordinate: { x: 0, y: 0 },
    }
    : undefined;

  return (
    <div className="relative h-[400px] w-full">
      <ChartContainer config={chartConfig} className="size-full">
        <RadarChart data={rows}>
          <PolarGrid stroke="var(--muted-foreground)" strokeWidth={1} />
          <PolarAngleAxis dataKey="metric" tick={{ fill: "var(--foreground)", opacity: 0.8, fontSize: 9 }} tickLine={false} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: "var(--muted-foreground)", fontSize: 10 }} tickCount={6} />

          {series.map(name => {
            const color = colorBySeries[name];
            const faded = hoverSeries && hoverSeries !== name;
            return (
              <Radar
                key={name}
                name={name}
                dataKey={name}
                stroke={color}
                fill={color}
                strokeOpacity={faded ? 0.35 : 1}
                fillOpacity={faded ? 0.08 : 0.22}
                strokeWidth={faded ? 1.5 : 2.5}
                onMouseEnter={() => setHoverSeries(name)}
                onMouseLeave={() => setHoverSeries(null)}
                isAnimationActive={false}
              />
            );
          })}

          <ChartTooltip
            cursor={false}
            content={props => (
              <FitTooltip
                {...props}
                selectedSeries={(hoverSeries ?? legendHover) || undefined}
                colorBySeries={colorBySeries}
              />
            )}
          />

          <Legend
            iconType="rect"
            formatter={series => {
              const tipProps = buildLegendTip(series);
              return (
                <Tooltip delayDuration={50}>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        'text-sm font-metric pr-2 align-middle',
                        (hoverSeries && hoverSeries !== series) ? 'text-muted-foreground' : `text-[${colorBySeries[series]}]`
                      )}
                      onMouseEnter={() => setLegendHover(series)}
                      onMouseLeave={() => setLegendHover(null)}
                    >
                      {series}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="p-0 pointer-events-none">
                    {tipProps &&
                      <FitTooltip {...tipProps} selectedSeries={series} colorBySeries={colorBySeries} />
                    }
                  </TooltipContent>
                </Tooltip>
              );
            }}
          />
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
function StackedBars({
  rows,
  series,
  categoryKey,
  hoverOpacity = 0.5,
  buildDetailFn,
}: StackedBarsProps) {
  const [hoverSeries, setHoverSeries] = useState<string | null>(null);

  // build meta for series mapping and CSS vars
  const meta = series.map((label, i) => ({
    label, // series label (company/opportunity)
    key: `series_${i + 1}`,
    colorVar: `var(--chart-${(i % 8) + 1})`,
  }));

  const labelByKey = Object.fromEntries(meta.map(m => [m.key, m.label])) as Record<string, string>;

  // color map by label so FitTooltip can color the header
  const colorBySeries = Object.fromEntries(meta.map(m => [m.label, m.colorVar])) as Record<string, string>;

  const config = Object.fromEntries(meta.map(m => [m.key, { label: m.label, color: m.colorVar }])) as ChartConfig;

  // normalize rows + attach per-series detail for tooltip
  const chartData = rows.map(r => {
    const safe = Object.fromEntries(meta.map(m => [m.key, Number(r[m.label] ?? r[m.key] ?? 0)]));
    const detail = Object.fromEntries(meta.map(m => {
      const data = buildDetailFn ? buildDetailFn(m.label, r) : null;
      if (!data) return [m.label, null];
      // flatten metrics
      const { metrics, fullTitle, primaryNaics, naicsCode } = data;
      const normalized = metrics
        ? { fullTitle, primaryNaics, naicsCode, ...metrics }
        : data;

      return [m.label, normalized];
    }),
    );

    return {
      [categoryKey]: r[categoryKey],
      fullTitle: r.fullTitle,
      __detail: detail,
      ...safe,
    };
  });

  // legend uses first row for its synthetic tooltip
  const legendRow = chartData?.[0];

  // per-series min/max for alpha gradient
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

  function getRadius(meta_: Record<string, string>, idx: number) {
    const R = {
      ALL: [4, 4, 4, 4],
      TOP: [4, 4, 0, 0],
      BOT: [0, 0, 4, 4],
      MID: [0, 0, 0, 0],
    } as Record<string, [number, number, number, number]>;
    let radius: [number, number, number, number] = [0, 0, 0, 0];
    if (meta_.key.length === 1) radius = R.ALL;
    else if (idx === 0) radius = R.BOT;
    else if (idx === meta_.key.length - 1) radius = R.TOP;
    else radius = R.MID;
    return radius;
  }

  const buildTooltip = (label: string) => legendRow
    ? {
      active: true,
      payload: [{ payload: legendRow, dataKey: label }],
      coordinate: { x: 0, y: 0 },
    }
    : undefined;

  // wrap recharts tooltip payload
  const renderFitTooltip = (p: any) => {
    if (!p || !p.active || !p.payload || p.payload.length === 0) return null;

    const seg = p.payload.find((entry: any) => typeof entry?.dataKey === 'string' && entry.dataKey in labelByKey) ?? p.payload[0];
    const key = seg.dataKey as string;
    const label = labelByKey[key] || key;
    const rewritten = {
      ...p,
      payload: [{ ...seg, dataKey: label }],
    };

    return <FitTooltip {...rewritten} selectedSeries={label} colorBySeries={colorBySeries} />;
  };



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
          <YAxis domain={[0, 100]} hide />

          <ChartTooltip
            cursor={{ fill: "var(--foreground)", opacity: hoverOpacity }}
            content={renderFitTooltip}
          />

          <Legend
            iconType="rect"
            formatter={label => {
              const tipProps = buildTooltip(label);
              const faded = hoverSeries && hoverSeries !== label;
              return (
                <Tooltip delayDuration={50}>
                  <TooltipTrigger asChild>
                    <span
                      className={cn(
                        'text-xs font-metric pr-2 align-middle cursor-default',
                        faded ? 'text-muted-foreground' : `text-[${colorBySeries[label]}]`
                      )}
                      onMouseEnter={() => setHoverSeries(label)}
                      onMouseLeave={() => setHoverSeries(null)}
                    >
                      {label}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent className="p-0">
                    {tipProps && renderFitTooltip(tipProps)}
                  </TooltipContent>
                </Tooltip>
              );
            }}
          />

          {meta.map((meta, idx) => {
            const faded = hoverSeries && hoverSeries !== meta.label;
            return (
              <Bar
                key={meta.key}
                dataKey={meta.key}
                stackId="a"
                fill={`var(--color-${meta.key})`}
                radius={getRadius(meta, idx)}
                onMouseEnter={() => setHoverSeries(meta.label)}
                onMouseLeave={() => setHoverSeries(null)}
                fillOpacity={faded ? 0.35 : 1}
                maxBarSize={100}
              >
                {chartData.map((row, idx) =>
                  <Cell key={`${meta.key}-${idx}`} fillOpacity={alpha(meta.key, Number(row[meta.key] ?? 0))} />
                )}
              </Bar>
            );
          })}
        </BarChart>
      </ChartContainer>
    </div>
  );
}


function CompanySelector({ select, onToggle }: { select: string[]; onToggle: (name: string) => void; }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="border-border/30 bg-background hover:bg-bot">
          <Plus className="size-3" />
          Companies ({select.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto border-0" align="end">
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Select Companies</h4>
          <div className="space-y-2">
            {MOCK_COMPANIES.map(c => (
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
        <Button variant="outline" className="border-border/30 bg-background hover:bg-bot">
          <Plus className="size-3" />
          Opportunities ({select.length})
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 max-h-96 overflow-y-auto border-0" align="end">
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

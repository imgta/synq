import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import type { TooltipProps } from 'recharts';

import { cn } from '@/lib/utils';
import { Reason } from '@/utils';
import { MetricReason } from '@/components/dataviz/metric-reason';
import { MetricRow } from '@/components/dataviz/metric-row';
import { Layers, OctagonAlert, CircleGauge, Users } from 'lucide-react';
import { type FitScoreMetrics } from '@/utils';

export type FitTooltipExtras = {
  selectedSeries?: string | null;
  colorBySeries?: Record<string, string>;
};
export type FitTooltipProps = TooltipProps<ValueType, NameType> & FitTooltipExtras;

export function FitTooltip(props: FitTooltipProps) {
  const { active, payload, selectedSeries, colorBySeries } = props;
  if (!active || !payload || payload.length === 0) return null;

  const row = (payload[0]?.payload ?? {});
  // prefer explicitly selected series (hovered polygon or legend)
  let seriesKey = selectedSeries && row?.__detail?.[selectedSeries] ? selectedSeries : undefined;
  // fallback to series under cursor
  if (!seriesKey) seriesKey = (payload.find(p => row?.__detail?.[p.dataKey as string])?.dataKey as string) || (payload[0].dataKey as string);

  const detail = row?.__detail?.[seriesKey];
  if (!detail) return null;

  const seriesColor = colorBySeries?.[seriesKey];
  const metrics = detail as FitScoreMetrics;

  return (
    <section className="bg-card/85 backdrop-blur-sm border-border/15 rounded-sm p-4 w-64 space-y-3">
      {/* HEADER */}
      <div className="space-y-1 text-xs">
        <p
          className="font-medium text-card-foreground uppercase line-clamp-1 dark:brightness-150"
          style={seriesColor ? { color: seriesColor } : undefined}
        >
          {seriesKey}
        </p>
        <p className="text-muted-foreground">
          {detail.primaryNaics
            ? `Primary NAICS: ${detail.primaryNaics}`
            : `NAICS: ${detail.naicsCode}`
          }
        </p>
      </div>

      {/* METRICS */}
      <div className="space-y-1.5 pt-2 border-t border-border/40">
        <div className="flex justify-between items-center">
          <span className="text-xs text-card-foreground font-medium">Overall Fit</span>
          <span className="text-sm font-medium text-primary">{detail.overallScore}%</span>
        </div>

        <div className="space-y-1 text-xs">
          <MetricRow icon={Layers} label="NAICS Match" score={metrics.naicsScore} />
          <MetricRow icon={OctagonAlert} label="Set-Aside" score={metrics.setAsideScore} na={!metrics.setAsideRequired} />
          <MetricRow icon={Users} label="Capacity (Size)" score={metrics.sizeScore} />
          <MetricRow icon={CircleGauge} label="Capability" score={metrics.capabilityScore} />
        </div>

        <div className="space-y-1.5 border-t border-border/40">
          {metrics.reasoning && metrics.reasoning.length > 0 && (
            <ul className="mt-2 space-y-1">
              {metrics.reasoning.map((reason, idx) =>
                <MetricReason key={idx} reason={reason} />
              )}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
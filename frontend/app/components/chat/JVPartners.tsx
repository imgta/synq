import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { Info } from 'lucide-react';
import { PartnerCompareArgs } from '@/components/chat/ChatMessage';

export type JVPartnersOutput = {
  lead?: {
    id?: string;
    name?: string;
    primary_naics?: string;
    other_naics?: string[];
    sba_certifications?: string[];
  };
  opportunity?: {
    notice_id?: string;
    title?: string;
    naics_code?: string;
    secondary_naics?: string[];
    set_aside_code?: string | null;
  };
  suggested_partners?: Array<{
    partner: {
      id?: string;
      name?: string;
      primary_naics?: string;
      other_naics?: string[];
      sba_certifications?: string[];
    };
    metrics: {
      fitScore: number;
      distance: number;
      scoreBreakdown: {
        semanticScore: number;
        naicsCoverageScore: number;
        setAsideScore: number;
        overlapPenalty: number;
      };
      naicsGapsFilled: string[];
    };
  }>;
  preselect_sample_size?: number;
  error?: any;
};

type JVPartnersProps = {
  data: JVPartnersOutput;
  onPartnerClick?: (args: PartnerCompareArgs) => void;
};


export function JVPartners({ data, onPartnerClick }: JVPartnersProps) {
  const lead = data?.lead ?? {};
  const opportunity = data?.opportunity ?? {};
  const suggested = Array.isArray(data?.suggested_partners) ? data!.suggested_partners! : [];
  const sampleSize = Number.isFinite(data?.preselect_sample_size) ? data!.preselect_sample_size! : 0;

  return (
    <TooltipProvider>
      <section className="rounded-2xl bg-card text-foreground p-6 space-y-4 border">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Joint Venture Partner Recommendations</h3>
          <div className="text-sm text-muted-foreground">
            Preselect sample size: <span className="font-mono">{sampleSize}</span>
          </div>
        </div>

        <div className="grid gap-2 text-sm border-t pt-4">
          <div>
            <span className="font-medium text-foreground">Lead Company:</span>{' '}
            <span className="text-primary font-semibold">{lead.name}</span>
            <span className="font-mono text-muted-foreground"> &mdash; {lead.primary_naics}</span>
          </div>
          <div>
            <span className="font-medium text-foreground">Opportunity:</span>{' '}
            <span>{opportunity.title} ({opportunity.notice_id})</span>
            <span className="font-mono text-muted-foreground"> &mdash; NAICS {opportunity.naics_code}</span>
            {opportunity.secondary_naics?.length ? <div className="text-xs text-muted-foreground mt-1">Required Secondary NAICS: {opportunity.secondary_naics.join(', ')}</div> : null}
            {opportunity.set_aside_code ? <div className="text-xs text-muted-foreground mt-1">Set-Aside: <span className="font-semibold">{opportunity.set_aside_code}</span></div> : null}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left border-b border-border">
                <th className="py-2 pr-3 font-semibold">JV Candidate</th>
                <th className="py-2 px-3 font-semibold text-center w-24">Fit Score</th>
                <th className="py-2 px-3 font-semibold text-center w-36">NAICS Coverage</th>
                <th className="py-2 px-3 font-semibold text-center w-24">Set-Aside</th>
                <th className="py-2 px-3 font-semibold text-center w-20">
                  <div className="flex items-center justify-center gap-1">
                    Penalty
                    <Tooltip>
                      <TooltipTrigger>
                        <Info size={14} />
                      </TooltipTrigger>
                      <TooltipContent className="bg-card/85 backdrop-blur-[2px] border border-border/15 rounded-sm p-4 text-card-foreground">
                        Penalty applied for primary NAICS overlap.
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {suggested.map(({ partner, metrics }) => {
                const breakdown = metrics.scoreBreakdown;
                const penaltyApplied = breakdown.overlapPenalty < 1.0;
                const penaltyPercentage = (1 - (breakdown.overlapPenalty ?? 1.0)) * 100;
                let setAsideDisplay: { text: string; className: string; };
                if (breakdown.setAsideScore === 1.0) {
                  setAsideDisplay = { text: 'Qualified', className: 'bg-emerald-500/20 text-emerald-400' };
                } else if (breakdown.setAsideScore > 0) {
                  setAsideDisplay = { text: 'Eligible', className: 'bg-blue-500/20 text-blue-400' };
                } else {
                  setAsideDisplay = { text: 'N/A', className: 'bg-muted/50 text-muted-foreground' };
                }

                return (
                  <tr
                    className="border-b border-border/50 last:border-none hover:bg-muted/50 cursor-pointer"
                    key={partner.id}
                    onClick={() => {
                      if (onPartnerClick) onPartnerClick({ lead, partner, opportunity });
                    }}
                  >
                    <td className="py-2.5 px-3">
                      <div className="font-medium">{partner.name}</div>
                      <div className="text-muted-foreground font-mono text-xs">{partner.primary_naics}</div>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="font-metric text-xl text-primary cursor-help tracking-wide">
                            {(metrics.fitScore * 100).toFixed(1)}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-card/85 backdrop-blur-[2px] border border-border/15 rounded-sm p-4">
                          <div className="grid grid-cols-[auto,1fr] gap-x-2 gap-y-1 text-xs">
                            <p className="text-muted-foreground font-medium">
                              Semantic Fit: <span className="font-mono font-light text-card-foreground tracking-tighter">
                                {(breakdown.semanticScore * 100).toFixed(1)}
                              </span>
                            </p>

                            <p className="text-muted-foreground font-medium">
                              NAICS Coverage: <span className="font-mono font-light text-card-foreground tracking-tighter">
                                {(breakdown.naicsCoverageScore * 100).toFixed(1)}
                              </span>
                            </p>

                            <p className="text-muted-foreground font-medium">
                              Set-Aside Bonus: <span className="font-mono font-light text-card-foreground tracking-tighter">
                                {(breakdown.setAsideScore * 100).toFixed(1)}
                              </span>
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="py-2 px-3 font-mono text-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="cursor-help border-b border-dashed border-muted-foreground">
                            {Math.round(breakdown.naicsCoverageScore * 100)}%
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-card/85 backdrop-blur-[2px] border border-border/15 rounded-sm p-4">
                          {metrics.naicsGapsFilled.length > 0 ? (
                            <div>
                              <p className="text-xs text-muted-foreground mb-1">Covers NAICS codes:</p>
                              <ul className="list-disc list-inside font-mono text-xs font-light text-card-foreground">
                                {metrics.naicsGapsFilled.map(code => <li key={code}>{code}</li>)}
                              </ul>
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">No capability gaps covered.</p>
                          )}
                        </TooltipContent>
                      </Tooltip>
                    </td>
                    <td className="py-2 px-3 text-center">
                      <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', setAsideDisplay.className)}>
                        {setAsideDisplay.text}
                      </span>
                    </td>
                    <td className="py-2 px-3 font-mono font-light text-center">
                      <span className={cn(
                        'opacity-85',
                        penaltyApplied ? 'text-destructive' : 'text-muted-foreground'
                      )}>
                        {penaltyApplied ? `-${penaltyPercentage.toFixed(0)}%` : '—'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {!suggested.length && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-muted-foreground">No suitable partners found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </TooltipProvider>
  );
}
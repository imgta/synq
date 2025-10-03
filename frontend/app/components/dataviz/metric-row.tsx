import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Band = 'perfect' | 'strong' | 'moderate' | 'weak' | 'na';

function bandFromScore(score: number, na = false): Band {
  if (na) return 'na';
  if (score >= 95) return 'perfect';
  if (score >= 80) return 'strong';
  if (score >= 60) return 'moderate';
  return 'weak';
}

const BAND_COLOR: Record<Band, string> = {
  perfect: 'text-emerald-500 dark:text-emerald-300',
  strong: 'text-emerald-500 dark:text-emerald-300',
  moderate: 'text-amber-600 dark:text-amber-400',
  weak: 'text-rose-600 dark:text-rose-400',
  na: 'text-muted-foreground',
};

export type MetricRowProps = {
  icon: LucideIcon;
  label: string;
  score: number;
  na?: boolean;
  className?: string;
};
export function MetricRow({
  icon: Icon,
  label,
  score,
  na = false,
  className,
}: MetricRowProps) {
  const band = bandFromScore(score, na);
  const color = BAND_COLOR[band];

  return (
    <div className={cn('flex justify-between items-center', className)}>
      <div className="flex items-center gap-2 space-y-0.5">
        <Icon className="size-4.5 text-card-foreground/85" aria-hidden />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <span className={cn('text-xs font-medium', color)}>
        {na ? 'N/A' : `${score}%`}
      </span>
    </div>
  );
}

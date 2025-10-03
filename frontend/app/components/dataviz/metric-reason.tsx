import { XCircle, AlertTriangle, BadgeCheck, MessageCircleQuestionMark, Info, Handshake, Combine } from 'lucide-react';
import type { Reason, ReasonKind } from '@/utils';
import { cn } from '@/lib/utils';

const ICON: Record<ReasonKind, React.ComponentType<{ className?: string; }>> = {
  pass: BadgeCheck,
  fail: XCircle,
  warn: AlertTriangle,
  info: Info,
  weak: Combine,
  jv: Handshake,
};

const COLOR: Record<ReasonKind, string> = {
  pass: 'text-emerald-600 dark:text-emerald-400',
  fail: 'text-rose-600 dark:text-rose-400',
  warn: 'text-amber-600 dark:text-amber-400',
  info: 'text-blue-600 dark:text-blue-400',
  weak: 'text-muted-foreground',
  jv: 'text-primary',
};

export function MetricReason({ reason }: { reason: Reason; }) {
  const Icon = ICON[reason.kind];
  const textColor = COLOR[reason.kind];
  return (
    <li className="flex items-center gap-2.5">
      <Icon className={cn('size-4 shrink-0', textColor)} aria-hidden />
      <span className="text-xs leading-5 text-card-foreground">{reason.text}</span>
    </li>
  );
}
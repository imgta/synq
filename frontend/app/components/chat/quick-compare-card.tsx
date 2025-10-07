import { ChevronsRight, Earth, ChartNoAxesCombined, Cctv, Cpu, Blocks, Radar } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface QuickCompareCardProps {
  icon?: React.ReactNode;
  title: string;
  subheader: string;
  tags?: string[];
  onClick?: () => void;
  className?: string;
};

export function QuickCompareCard({
  icon,
  title,
  subheader,
  tags = [],
  onClick,
  className,
}: QuickCompareCardProps) {
  return (
    <Card
      role={onClick ? 'button' : 'region'}
      tabIndex={onClick ? 0 : -1}
      onClick={onClick}
      onKeyDown={e => {
        if (!onClick) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'group relative p-4 sm:p-6 h-full',
        'bg-card/80 border-border/10 gap-1 sm:gap-2',
        'hover:bg-background transition-colors',
        'cursor-pointer rounded-xl',
        className,
      )}
    >

      <div className="hidden sm:inline-flex items-center justify-center rounded-full bg-primary/5 text-primary/90 size-8 group-hover:bg-white">
        {icon}
      </div>

      <h4 className="sm:text-lg font-medium text-foreground tracking-tight font-metric">
        {title}
      </h4>
      <p className="text-sm text-muted-foreground line-clamp-2">{subheader}</p>

      {/* badges */}
      <div className="mt-auto">
        {tags && tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag, idx) => (
              <Badge key={idx} variant="outline" className="bg-background text-xs border-border/15">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>

      {/* subtle chevron accent */}
      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
        <ChevronsRight className="size-4 text-brand/75" />
      </div>
    </Card>
  );
}

import type { CompareOptions } from '@/components/dataviz/radar-chart';

type QuickCompareItem = {
  icon: React.ReactNode;
  title: string;
  subheader: string;
  options: CompareOptions;
  className?: string;
};

export const CARD_ITEMS: QuickCompareItem[] = [
  {
    icon: <Earth className="size-4" />,
    title: "The 'Dream Team' JV",
    subheader: "A $45M contract needs both environmental remediation (8a) and secure construction (HZ).",
    options: {
      view: 'opportunity',
      companies: ['Ridgeline Builders', 'Terra Sift'],
      opportunities: ['BASE-2025-009'],
    },
  },
  {
    icon: <ChartNoAxesCombined className="size-4" />,
    title: 'Specialists vs Golden Dome',
    subheader: 'Can Apex, Contrail, and Ironclad cover C2 software and radar integration across two GD opps?',
    options: {
      view: 'opportunity',
      companies: ['Apex Integration Partners', 'Contrail Analytics', 'Ironclad Embedded'],
      opportunities: ['GD-2025-001', 'GD-2025-002'],
      anchorOpportunity: 'GD-2025-001',
    },
  },
  {
    icon: <Cctv className="size-4" />,
    title: 'New-Era Battlefield Sensors',
    subheader: 'UAV analytics, radar modules, and biosurveillance systems are converging on major sensor procurements.',
    options: {
      view: 'opportunity',
      companies: ['Contrail Analytics', 'Sentinel Microsystems', 'BioShield Innovations'],
      opportunities: ['GD-2025-002', 'CBRN-2025-007'],
    },
  },
  {
    icon: <Cpu className="size-4" />,
    title: 'The Niche Subcontractor',
    subheader: 'An $18M VR training contract requires multilingual support, creating a perfect role for PolyGlot.',
    options: {
      view: 'opportunity',
      companies: ['Tristimuli', 'PolyGlot Defense Solutions'],
      opportunities: ['STE-2025-005'],
    },
    className: 'sm:border-l sm:border-white/10',
  },
  {
    icon: <Blocks className="size-4" />,
    title: 'Prime vs. Specialists',
    subheader: 'Can an integrator like Apex handle a complex C2 contract alone, or do they need niche subs?',
    options: {
      view: 'opportunity',
      companies: ['Apex Integration Partners', 'Contrail Analytics', 'Ironclad Embedded'],
      opportunities: ['GD-2025-001'],
    },
    className: 'lg:border-l-0 lg:border-white/10',
  },
  {
    icon: <Radar className="size-4" />,
    title: 'Radar Modernization Race',
    subheader: 'Defense giants and niche manufacturers are vying for contracts spanning command software, AESA radar hardware, and next-gen detection systems.',
    options: {
      view: 'opportunity',
      companies: ['Apex Integration Partners', 'Sentinel Microsystems'],
      opportunities: ['GD-2025-001', 'GD-2025-002', 'CBRN-2025-007'],
      anchorOpportunity: 'GD-2025-002',
    },
  },
];
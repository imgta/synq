import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronsRight } from 'lucide-react';
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
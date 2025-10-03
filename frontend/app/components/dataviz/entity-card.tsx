import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type CompanyEntity = {
  name: string;
  description?: string;
  primary_naics: string;
  other_naics: string[];
  sba_certifications: string[];
};

type OpportunityEntity = {
  title: string;
  description?: string;
  notice_id?: string;
  naics_code: string;
  secondary_naics?: string[];
  set_aside_code?: string | null;
  estimated_value?: number; // dollars
};

export type Entity = CompanyEntity | OpportunityEntity;

function isCompany(entity: Entity): entity is CompanyEntity {
  return 'primary_naics' in entity;
}

function formatMillions(n: number) {
  return `$${(n / 1_000_000).toFixed(1)}M`;
}

export interface EntityCardProps {
  entity: Entity;
  className?: string;
  maxOtherNaics?: number; // default 3
}

export function EntityCard({
  entity,
  className,
  maxOtherNaics = 3,
}: EntityCardProps) {
  return (
    <section className={cn('p-4 rounded-lg bg-secondary/30 border border-border/40 space-y-3', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-2">
          <h4 className="font-metric text-lg/5 uppercase">
            {'name' in entity && entity.name}
            {'title' in entity && entity.title}
          </h4>
          <p className="text-pretty text-[.825rem]/6 text-muted-foreground line-clamp-3">
            {'description' in entity && entity.description}
            {'notice_id' in entity && entity.notice_id && ` Notice ID: ${entity.notice_id}`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {isCompany(entity) ? (
          <>
            {/* NAICS */}
            <Badge variant="outline" className="bg-primary/5 border-primary/25 text-primary text-xs">
              {entity.primary_naics}
            </Badge>
            {entity.other_naics.slice(0, maxOtherNaics).map(naics => (
              <Badge key={naics} variant="outline" className="bg-secondary border-border/40 text-xs">
                {naics}
              </Badge>
            ))}
            {entity.other_naics.length > maxOtherNaics && (
              <Badge variant="outline" className="bg-secondary/60 border-border/40 text-xs">
                +{entity.other_naics.length - maxOtherNaics} more
              </Badge>
            )}

            {/* SBA CERTS */}
            {entity.sba_certifications.length > 0 && (
              <Badge variant="outline" className="bg-accent/50 border-accent text-xs">
                {entity.sba_certifications.join(', ')}
              </Badge>
            )}
          </>
        ) : (
          <>
            {/* NAICS */}
            <Badge variant="outline" className="bg-primary/5 border-primary/25 text-primary text-xs">
              {entity.naics_code}
            </Badge>
            {entity.secondary_naics?.map(naics => (
              <Badge key={naics} variant="outline" className="bg-secondary border-border/40 text-xs">
                {naics}
              </Badge>
            ))}

            {/* SET-ASIDES */}
            {entity.set_aside_code && (
              <Badge variant="outline" className="bg-accent/50 border-accent text-xs">
                {entity.set_aside_code}
              </Badge>
            )}

            {/* CONTRACT VALUE */}
            {entity.estimated_value && (
              <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-xs">
                {formatMillions(entity.estimated_value)}
              </Badge>
            )}
          </>
        )}
      </div>
    </section>
  );
}

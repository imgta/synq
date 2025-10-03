import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
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

export interface EntityAccordionProps {
  entities: Entity[];
  className?: string;
  defaultOpenIndex?: number; // set which item opens by default
  maxOtherNaics?: number; // company NAICS truncation (default 3)
}

export function EntityAccordion({
  entities,
  className,
  defaultOpenIndex = 0,
  maxOtherNaics = 3,
}: EntityAccordionProps) {
  return (
    <Accordion
      type="single"
      collapsible
      className={cn('w-full px-4', className)}
      defaultValue={entities.length ? `item-${defaultOpenIndex}` : undefined}
    >
      {entities.map((entity, idx) => (
        <AccordionItem key={idx} value={`item-${idx}`} className="border-border/40 pt-1">
          <AccordionTrigger className="py-1.5">
            <div className="flex w-full items-center justify-between">
              <h4 className="font-metric text-base/5 uppercase">
                {'name' in entity && entity.name}
                {'title' in entity && entity.title}
              </h4>
              <div className="flex gap-1">
                {isCompany(entity) ? (
                  <>
                    <Badge variant="outline" className="bg-primary/5 border-primary/25 text-primary text-[10px]">
                      {entity.primary_naics}
                    </Badge>
                    {entity.sba_certifications.length > 0 && (
                      <Badge variant="outline" className="bg-accent/50 border-accent text-[10px]">
                        {entity.sba_certifications.join(', ')}
                      </Badge>
                    )}
                  </>
                ) : (
                  <>
                    <Badge variant="outline" className="bg-primary/5 border-primary/25 text-primary text-[10px]">
                      {entity.naics_code}
                    </Badge>
                    {entity.set_aside_code && (
                      <Badge variant="outline" className="bg-accent/50 border-accent text-[10px]">
                        {entity.set_aside_code}
                      </Badge>
                    )}
                    {entity.estimated_value && (
                      <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-[10px]">
                        {formatMillions(entity.estimated_value)}
                      </Badge>
                    )}
                  </>
                )}
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="flex flex-col gap-4 text-pretty">
            <p className="text-[.9rem]/6 text-muted-foreground">
              {'description' in entity && entity.description}
            </p>

            {/* META DATA */}
            {isCompany(entity) ? (
              <div className="items-center space-y-2">
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Primary NAICS:</span>
                  <Badge variant="outline" className="text-xs bg-primary/5 border-primary/25 text-primary">
                    {entity.primary_naics}
                  </Badge>
                </div>
                {entity.other_naics.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Other NAICS:</span>
                    <div className="flex gap-1.5">
                      {entity.other_naics.map((n) => (
                        <Badge key={n} variant="outline" className="text-xs bg-secondary border-border/40">
                          {n}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {entity.sba_certifications.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">SBA:</span>
                    <Badge variant="outline" className="text-xs bg-accent/50 border-accent">
                      {entity.sba_certifications.join(', ')}
                    </Badge>
                  </div>
                )}
              </div>
            ) : (
              <div className="items-center space-y-2">
                {'notice_id' in entity && entity.notice_id && (
                  <div className="flex items-center gap-1 pb-2">
                    <p className="text-xs font-medium">
                      Notice ID:
                      <span className="font-metric pl-1 text-sm">
                        {entity.notice_id}
                      </span>
                    </p>
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">NAICS:</span>
                  <Badge variant="outline" className="text-xs bg-primary/5 border-primary/25 text-primary">
                    {entity.naics_code}
                  </Badge>
                </div>
                {entity.secondary_naics && entity.secondary_naics.length > 0 && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Secondary:</span>
                    <div className="flex flex-wrap gap-1">
                      {entity.secondary_naics.map((n) => (
                        <Badge key={n} variant="outline" className="text-xs bg-secondary border-border/40">
                          {n}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {entity.set_aside_code && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Set-Aside:</span>
                    <Badge variant="outline" className="text-xs bg-accent/50 border-accent">
                      {entity.set_aside_code}
                    </Badge>
                  </div>
                )}
                {entity.estimated_value && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground">Est. Value:</span>
                    <Badge variant="outline" className="text-xs bg-green-500/10 border-green-500/30">
                      {formatMillions(entity.estimated_value)}
                    </Badge>
                  </div>
                )}
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

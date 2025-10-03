import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2 } from 'lucide-react';

export interface NAICSCode {
  code: string;
  level: string;
  title: string;
  justification: string;
}

interface NAICSClassificationProps {
  data: { naicsCodes: NAICSCode[]; };
}

export function NAICSClassification({ data }: NAICSClassificationProps) {
  const { naicsCodes } = data;

  return (
    <Card className="w-full border-none">
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-lg">
            <Building2 className="size-5" />
          </div>
          <CardTitle className="text-xl">NAICS Classification Results</CardTitle>
        </div>
        <CardDescription>
          Found {naicsCodes.length} relevant NAICS code{naicsCodes.length !== 1 ? 's' : ''}:
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {naicsCodes.map((naics, index) => (
          <div key={naics.code} className="p-4 rounded-lg border border-foreground/10 bg-card hover:bg-brand/5 transition-colors">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-start gap-3">
                <div className="flex items-center justify-center size-6 p-2 rounded-full bg-primary/5 text-primary font-semibold text-xs">
                  {index + 1}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-medium text-lg">
                      NAICS:
                      <span className="font-mono font-light pl-1 tracking-tight">
                        {naics.code}
                      </span>
                    </h3>
                    <Badge className="text-xs bg-brand/85 text-bot px-1 font-metric">
                      {naics.level.replace('_', ' ')}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground text-balance">{naics.title}</p>
                </div>

              </div>
            </div>
            <div className="px-2 border-t border-border/15 pt-3">
              <p className="text-sm leading-relaxed text-foreground/80">{naics.justification}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

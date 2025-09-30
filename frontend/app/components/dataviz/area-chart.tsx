import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';

interface DataAreaChartProps {
  title: string;
  description?: string;
  data: Array<{ name: string;[key: string]: any; }>;
  areas: Array<{ key: string; label: string; }>;
}

export function DataAreaChart({ title, description, data, areas }: DataAreaChartProps) {
  const config = areas.reduce(
    (acc, area, index) => {
      acc[area.key] = {
        label: area.label,
        color: `hsl(var(--chart-${index + 1}))`,
      };
      return acc;
    },
    {} as Record<string, { label: string; color: string; }>,
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <ChartContainer config={config} className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              {areas.map((area, index) => (
                <Area
                  key={area.key}
                  type="monotone"
                  dataKey={area.key}
                  stackId="1"
                  stroke={`var(--color-${area.key})`}
                  fill={`var(--color-${area.key})`}
                  fillOpacity={0.6}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
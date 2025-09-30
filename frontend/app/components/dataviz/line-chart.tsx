import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Line, LineChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Legend } from 'recharts';

interface DataLineChartProps {
  title: string;
  description?: string;
  data: Array<{ name: string;[key: string]: any; }>;
  lines: Array<{ key: string; label: string; color: string; }>;
}

export function DataLineChart({ title, description, data, lines }: DataLineChartProps) {
  const config = lines.reduce(
    (acc, line, index) => {
      acc[line.key] = {
        label: line.label,
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
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
              <YAxis tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              {lines.map((line) => (
                <Line
                  key={line.key}
                  type="monotone"
                  dataKey={line.key}
                  stroke={`var(--color-${line.key})`}
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

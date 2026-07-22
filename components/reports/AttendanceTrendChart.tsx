"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  present: { label: "Present", color: "var(--chart-1)" },
  late: { label: "Late", color: "var(--chart-3)" },
  absent: { label: "Absent", color: "var(--chart-5)" },
} satisfies ChartConfig;

type AttendanceTrendChartProps = {
  data: Array<{ date: string; present: number; late: number; absent: number }>;
};

export default function AttendanceTrendChart({
  data,
}: AttendanceTrendChartProps): React.JSX.Element {
  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <BarChart accessibilityLayer data={data} margin={{ left: 4, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="date"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          tickFormatter={(value) => value.slice(-2)}
        />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
        <ChartTooltip
          content={
            <ChartTooltipContent labelFormatter={(value) => `Date: ${value}`} />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="present"
          fill="var(--color-present)"
          stackId="attendance"
        />
        <Bar dataKey="late" fill="var(--color-late)" stackId="attendance" />
        <Bar
          dataKey="absent"
          fill="var(--color-absent)"
          stackId="attendance"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

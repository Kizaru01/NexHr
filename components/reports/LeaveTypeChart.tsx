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
  pending: { label: "Pending", color: "var(--chart-3)" },
  approved: { label: "Approved", color: "var(--chart-2)" },
  rejected: { label: "Rejected", color: "var(--chart-5)" },
} satisfies ChartConfig;

type LeaveTypeChartProps = {
  data: Array<{ name: string; pending: number; approved: number; rejected: number }>;
};

export default function LeaveTypeChart({ data }: LeaveTypeChartProps): React.JSX.Element {
  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <BarChart accessibilityLayer data={data} margin={{ left: 4, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="pending" fill="var(--color-pending)" stackId="status" />
        <Bar dataKey="approved" fill="var(--color-approved)" stackId="status" />
        <Bar dataKey="rejected" fill="var(--color-rejected)" stackId="status" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ChartContainer>
  );
}

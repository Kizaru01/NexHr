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
  grossPay: { label: "Gross pay", color: "var(--chart-1)" },
  netPay: { label: "Net pay", color: "var(--chart-2)" },
} satisfies ChartConfig;

type PayrollDepartmentChartProps = {
  data: Array<{ name: string; grossPay: number; netPay: number }>;
};

export default function PayrollDepartmentChart({ data }: PayrollDepartmentChartProps): React.JSX.Element {
  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <BarChart accessibilityLayer data={data} margin={{ left: 4, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
        <YAxis tickLine={false} axisLine={false} tickFormatter={(value) => `${value / 1000}k`} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar dataKey="grossPay" fill="var(--color-grossPay)" radius={4} />
        <Bar dataKey="netPay" fill="var(--color-netPay)" radius={4} />
      </BarChart>
    </ChartContainer>
  );
}

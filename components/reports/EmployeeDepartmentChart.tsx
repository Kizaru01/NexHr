"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";

const chartConfig = {
  employees: { label: "Employees", color: "var(--chart-1)" },
  activeEmployees: { label: "Active employees", color: "var(--chart-2)" },
} satisfies ChartConfig;

type EmployeeDepartmentChartProps = {
  data: Array<{ name: string; employees: number; activeEmployees: number }>;
};

export default function EmployeeDepartmentChart({
  data,
}: EmployeeDepartmentChartProps): React.JSX.Element {
  return (
    <ChartContainer config={chartConfig} className="h-80 w-full">
      <BarChart accessibilityLayer data={data} margin={{ left: 4, right: 12 }}>
        <CartesianGrid vertical={false} />
        <XAxis
          dataKey="name"
          tickLine={false}
          tickMargin={10}
          axisLine={false}
          interval={0}
        />
        <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="employees" fill="var(--color-employees)" radius={4} />
        <Bar
          dataKey="activeEmployees"
          fill="var(--color-activeEmployees)"
          radius={4}
        />
      </BarChart>
    </ChartContainer>
  );
}

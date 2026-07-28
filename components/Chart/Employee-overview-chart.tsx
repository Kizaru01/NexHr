"use client";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { employeeOverview } from "@/constants/dashboard-static";

const EmployeeOverviewChart = (): React.JSX.Element => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Employee movement</CardTitle>
        <CardDescription>
          Active employees and new hires across the month
        </CardDescription>
      </CardHeader>

      <CardContent className="h-[17rem] pl-1 sm:pl-3">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={employeeOverview}
            margin={{ top: 8, right: 12, bottom: 0, left: -12 }}
          >
            <CartesianGrid
              stroke="var(--border)"
              strokeDasharray="4 4"
              vertical={false}
            />

            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
              dy={8}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
            />

            <Tooltip
              cursor={{
                stroke: "var(--border-strong)",
                strokeDasharray: "4 4",
              }}
              contentStyle={{
                background: "var(--popover)",
                border: "1px solid var(--border)",
                borderRadius: "10px",
                boxShadow: "var(--shadow-elevated)",
                color: "var(--popover-foreground)",
                fontSize: "12px",
              }}
            />

            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: "12px", paddingTop: "14px" }}
            />

            <Line
              type="monotone"
              dataKey="activeEmployees"
              stroke="var(--chart-1)"
              strokeWidth={2.5}
              dot={{
                fill: "var(--card)",
                stroke: "var(--chart-1)",
                strokeWidth: 2,
                r: 3,
              }}
              activeDot={{ r: 5, fill: "var(--chart-1)" }}
            />

            <Line
              type="monotone"
              dataKey="newHires"
              stroke="var(--chart-2)"
              strokeWidth={2.5}
              dot={{
                fill: "var(--card)",
                stroke: "var(--chart-2)",
                strokeWidth: 2,
                r: 3,
              }}
              activeDot={{ r: 5, fill: "var(--chart-2)" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
export default EmployeeOverviewChart;

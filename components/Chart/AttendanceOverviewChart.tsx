"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { attendanceOverview } from "@/constants/dashboard-static";

export default function AttendanceOverviewChart(): React.JSX.Element {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Attendance overview</CardTitle>
        <CardDescription>
          Daily present, late, and absent employee totals
        </CardDescription>
      </CardHeader>

      <CardContent className="h-[17rem] pl-1 sm:pl-3">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={attendanceOverview}
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
              cursor={{ fill: "var(--muted)", opacity: 0.45 }}
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

            <Bar dataKey="present" fill="var(--chart-1)" radius={[5, 5, 0, 0]} />

            <Bar dataKey="late" fill="var(--chart-3)" radius={[5, 5, 0, 0]} />

            <Bar dataKey="absent" fill="var(--destructive)" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

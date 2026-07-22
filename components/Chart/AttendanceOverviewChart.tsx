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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { attendanceOverview } from "@/constants/dashboard-static";

export default function AttendanceOverviewChart(): React.JSX.Element {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Attendance</CardTitle>
      </CardHeader>

      <CardContent className="h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={attendanceOverview}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Bar dataKey="present" fill="#2563eb" radius={[5, 5, 0, 0]} />

            <Bar dataKey="late" fill="#f59e0b" radius={[5, 5, 0, 0]} />

            <Bar dataKey="absent" fill="#ef4444" radius={[5, 5, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

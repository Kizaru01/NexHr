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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { employeeOverview } from "@/constants/dashboard-static";

const EmployeeOverviewChart = () => {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Employee</CardTitle>
      </CardHeader>

      <CardContent className="h-[210px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={employeeOverview}>
            <CartesianGrid strokeDasharray="3 3" />

            <XAxis dataKey="day" />

            <YAxis />

            <Tooltip />

            <Legend />

            <Line
              type="monotone"
              dataKey="activeEmployees"
              stroke="#2563eb"
              strokeWidth={3}
            />

            <Line
              type="monotone"
              dataKey="newHires"
              stroke="#16a34a"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
export default EmployeeOverviewChart;

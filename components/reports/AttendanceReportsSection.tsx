import { CalendarX2, Clock3, Percent, Timer } from "lucide-react";

import AttendanceTrendChart from "@/components/reports/AttendanceTrendChart";
import { payrollMonthOptions } from "@/constants/filter-options";
import UrlFilterSelect from "@/components/hr/filters/UrlFilterSelect";
import StatCard from "@/components/hr/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAttendanceReports } from "@/lib/queries/reports.queries";

type AttendanceReportsSectionProps = {
  month?: string;
};

export default async function AttendanceReportsSection({
  month,
}: AttendanceReportsSectionProps): Promise<React.JSX.Element> {
  const attendance = await getAttendanceReports(month);

  return (
    <>
      <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Workforce time</p>
          <h2 className="mt-1 text-2xl font-bold tracking-tight">
            Attendance reports
          </h2>
          <p className="mt-1 text-muted-foreground">
            Review recorded attendance for {attendance.period}.
          </p>
        </div>
        <UrlFilterSelect
          field="attendanceMonth"
          label="Attendance report month"
          emptyLabel="Current month"
          options={payrollMonthOptions}
          className="sm:w-48"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Attendance rate"
          value={`${attendance.stats.attendanceRate}%`}
          icon={Percent}
        />
        <StatCard
          label="Late records"
          value={String(attendance.stats.late)}
          icon={Clock3}
        />
        <StatCard
          label="Absences"
          value={String(attendance.stats.absences)}
          icon={CalendarX2}
        />
        <StatCard
          label="Overtime hours"
          value={`${attendance.stats.overtimeHours}h`}
          icon={Timer}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-5">
        <Card className="xl:col-span-3">
          <CardHeader>
            <CardTitle>Daily attendance trend</CardTitle>
            <CardDescription>
              Recorded present, late, and absent attendance by day.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {attendance.dailyRecords.length ? (
              <AttendanceTrendChart data={attendance.dailyRecords} />
            ) : (
              <p className="py-20 text-center text-sm text-muted-foreground">
                Attendance data will appear as daily records are submitted.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Daily breakdown</CardTitle>
            <CardDescription>
              Recorded attendance counts by date.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {attendance.dailyRecords.length ? (
              <div className="max-h-90 overflow-auto">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-muted/50 text-left text-xs uppercase text-muted-foreground">
                    <tr>
                      <th className="px-5 py-3 font-medium">Date</th>
                      <th className="px-5 py-3 text-right font-medium">
                        Present
                      </th>
                      <th className="px-5 py-3 text-right font-medium">Late</th>
                      <th className="px-5 py-3 text-right font-medium">
                        Absent
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendance.dailyRecords.map((record) => (
                      <tr key={record.date} className="border-t">
                        <td className="px-5 py-3 font-medium">
                          {new Date(
                            `${record.date}T00:00:00`
                          ).toLocaleDateString(undefined, {
                            month: "short",
                            day: "numeric",
                          })}
                        </td>
                        <td className="px-5 py-3 text-right">
                          {record.present}
                        </td>
                        <td className="px-5 py-3 text-right">{record.late}</td>
                        <td className="px-5 py-3 text-right">
                          {record.absent}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="px-6 py-20 text-center text-sm text-muted-foreground">
                No attendance data available.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
}

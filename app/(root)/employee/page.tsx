import Link from "next/link";
import {
  CalendarCheck2,
  Clock3,
  ClipboardList,
  Timer,
  Umbrella,
} from "lucide-react";

import EmptyState from "@/components/employee-portal/EmptyState";
import PageHeader from "@/components/employee-portal/PageHeader";
import StatCard from "@/components/hr/StatCard";
import StatusBadge from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireEmployeePage } from "@/lib/handler/require-employee";
import { getEmployeeDashboard } from "@/lib/queries/employee-portal/employee-portal.dashboard";
import { formatDisplayDate } from "@/lib/utils";

function formatTime(value: string | null): string {
  return value
    ? new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "—";
}

export default async function EmployeeDashboardPage(): Promise<
  React.JSX.Element
> {
  const { employeeDatabaseId } = await requireEmployeePage();
  const {
    announcements,
    holidays,
    recentLeaves,
    stats,
    todayAttendance,
  } = await getEmployeeDashboard(employeeDatabaseId);
  const {
    attendanceToday,
    monthlyAttendance,
    overtimeHours,
    pendingLeaves,
    remainingLeave,
  } = stats;

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Your workday"
        title="Welcome back"
        description="Keep track of your attendance, time away, and important company updates in one place."
        actions={
          <Button asChild>
            <Link href="/employee/leave">Request leave</Link>
          </Button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Attendance today"
          value={attendanceToday}
          icon={CalendarCheck2}
        />
        <StatCard
          label="Remaining leave"
          value={`${remainingLeave} days`}
          icon={Umbrella}
        />
        <StatCard
          label="This month"
          value={monthlyAttendance}
          icon={ClipboardList}
        />
        <StatCard
          label="Overtime hours"
          value={`${overtimeHours}h`}
          icon={Timer}
        />
        <StatCard
          label="Pending requests"
          dashboardValue={pendingLeaves}
          icon={Clock3}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Today&apos;s attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {todayAttendance ? (
              <div className="space-y-5">
                <StatusBadge status={todayAttendance.status} />
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Clock in</p>
                    <p className="mt-1 font-semibold">
                      {formatTime(todayAttendance.checkIn)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Clock out</p>
                    <p className="mt-1 font-semibold">
                      {formatTime(todayAttendance.checkOut)}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Working time</p>
                    <p className="mt-1 font-semibold">
                      {todayAttendance.workingHours}h
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Break duration</p>
                    <p className="mt-1 font-semibold">
                      {todayAttendance.breakDuration}m
                    </p>
                  </div>
                </div>
                <Button variant="outline" className="w-full" asChild>
                  <Link href="/employee/attendance">View attendance</Link>
                </Button>
              </div>
            ) : (
              <EmptyState
                title="No attendance record yet"
                description="Your clock-in and clock-out details will appear here."
              />
            )}
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Recent leave requests</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentLeaves.length ? (
              recentLeaves.map((leave) => (
                <div
                  key={leave.id}
                  className="flex items-start justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="font-medium">{leave.leaveType} leave</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {formatDisplayDate(leave.startDate)} –{" "}
                      {formatDisplayDate(leave.endDate)}
                    </p>
                  </div>
                  <StatusBadge status={leave.status} />
                </div>
              ))
            ) : (
              <EmptyState
                title="No leave requests"
                description="Requests you submit will be visible here."
              />
            )}
            <Button variant="link" className="px-0" asChild>
              <Link href="/employee/leave">Manage leave requests</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="xl:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming holidays</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {holidays.length ? (
              holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="border-b pb-4 last:border-0 last:pb-0"
                >
                  <p className="font-medium">{holiday.name}</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {formatDisplayDate(holiday.date)}
                    {holiday.description ? ` · ${holiday.description}` : ""}
                  </p>
                </div>
              ))
            ) : (
              <EmptyState
                title="No upcoming holidays"
                description="Company holidays will appear here when they are published."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent announcements</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {announcements.length ? (
            announcements.map((announcement) => (
              <div key={announcement.id} className="rounded-lg border p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-primary">
                    {announcement.category}
                  </p>
                  <StatusBadge status={announcement.priority} />
                </div>
                <h2 className="mt-3 font-semibold">{announcement.title}</h2>
                <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                  {announcement.description}
                </p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {formatDisplayDate(announcement.publishedAt)}
                </p>
              </div>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-4">
              <EmptyState
                title="No recent announcements"
                description="Published company news will appear here."
              />
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

import Link from "next/link";
import {
  ArrowLeft,
  Coffee,
  Clock3,
  FilePenLine,
  LogIn,
  LogOut,
  Timer,
} from "lucide-react";
import { notFound } from "next/navigation";

import AttendanceCorrectionForm from "@/components/employee-portal/AttendanceCorrectionForm";
import DetailList from "@/components/employee-portal/DetailList";
import PageHeader from "@/components/employee-portal/PageHeader";
import StatCard from "@/components/hr/StatCard";
import StatusBadge from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireEmployeePage } from "@/lib/handler/require-employee";
import { getOwnAttendanceDetail } from "@/lib/queries/employee-portal/employee-portal.attendance";

type PageProps = { params: Promise<{ id: string }> };

function formatDate(value: string | null): string {
  return value
    ? new Date(value).toLocaleDateString(undefined, {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "—";
}
function formatTime(value: string | null): string {
  return value
    ? new Intl.DateTimeFormat("en", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(value))
    : "Not recorded";
}

export default async function AttendanceDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { employeeDatabaseId } = await requireEmployeePage();
  const { id } = await params;
  const attendance = await getOwnAttendanceDetail(employeeDatabaseId, id);
  if (!attendance) notFound();

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/employee/attendance">
          <ArrowLeft /> Back to attendance
        </Link>
      </Button>
      <PageHeader
        eyebrow="Attendance record"
        title={formatDate(attendance.date)}
        description="Review your recorded workday and request a correction if something is inaccurate."
        actions={<StatusBadge status={attendance.status} />}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Working hours"
          value={`${attendance.workingHours}h`}
          icon={Timer}
        />
        <StatCard
          label="Overtime"
          value={`${attendance.overtimeHours}h`}
          icon={Clock3}
        />
        <StatCard
          label="Break duration"
          value={`${attendance.breakDuration}m`}
          icon={Coffee}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Attendance timeline</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0">
            {[
              {
                title: "Clock in",
                time: formatTime(attendance.checkIn),
                icon: LogIn,
              },
              {
                title: "Break duration",
                time: `${attendance.breakDuration} minutes`,
                icon: Coffee,
              },
              {
                title: "Clock out",
                time: formatTime(attendance.checkOut),
                icon: LogOut,
              },
            ].map((event, index) => {
              const Icon = event.icon;
              return (
                <div
                  key={event.title}
                  className="relative flex gap-4 pb-7 last:pb-0"
                >
                  <div className="flex flex-col items-center">
                    <div className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-4" />
                    </div>
                    {index < 2 ? (
                      <div className="mt-1 h-full w-px bg-border" />
                    ) : null}
                  </div>
                  <div className="pt-1">
                    <p className="font-medium">{event.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {event.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Record details</CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList
              details={[
                {
                  label: "Status",
                  value: <StatusBadge status={attendance.status} />,
                },
                {
                  label: "Working hours",
                  value: `${attendance.workingHours} hours`,
                },
                {
                  label: "Overtime",
                  value: `${attendance.overtimeHours} hours`,
                },
                {
                  label: "Notes",
                  value: attendance.remarks ?? "No notes recorded",
                },
              ]}
            />
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FilePenLine className="size-4" /> Request attendance correction
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceCorrectionForm
            attendanceId={attendance.id}
            hasPendingCorrection={attendance.hasPendingCorrection}
          />
        </CardContent>
      </Card>
    </section>
  );
}

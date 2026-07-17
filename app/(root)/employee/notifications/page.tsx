import Link from "next/link";
import { Bell, BellRing, CheckCheck } from "lucide-react";

import EmptyState from "@/components/employee-portal/EmptyState";
import PageHeader from "@/components/employee-portal/PageHeader";
import StatCard from "@/components/hr/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireEmployeePage } from "@/lib/handler/require-employee";
import { getEmployeeNotifications } from "@/queries/employee-portal.communications";

export default async function EmployeeNotificationsPage() {
  const employee = await requireEmployeePage();
  const notifications = await getEmployeeNotifications(employee.userId);

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="Stay informed"
        title="Notifications"
        description="Review updates about leave, attendance corrections, company news, and available payslips."
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard
          label="Unread notifications"
          dashboardValue={notifications.unread}
          icon={BellRing}
        />
        <StatCard
          label="Recent notifications"
          dashboardValue={notifications.total}
          icon={CheckCheck}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {notifications.notifications.length ? (
            notifications.notifications.map((notification) => {
              const content = (
                <div
                  className={`rounded-lg border p-4 transition-colors ${notification.isRead ? "bg-background" : "border-primary/30 bg-primary/5"}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                      <Bell className="size-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="font-medium">{notification.title}</p>
                        {!notification.isRead ? (
                          <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                            Unread
                          </span>
                        ) : null}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {notification.description}
                      </p>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {notification.type} ·{" "}
                        {notification.createdAt
                          ? new Date(notification.createdAt).toLocaleString()
                          : "—"}
                      </p>
                    </div>
                  </div>
                </div>
              );
              return notification.href ? (
                <Link key={notification.id} href={notification.href}>
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>{content}</div>
              );
            })
          ) : (
            <EmptyState
              title="You are all caught up"
              description="New employee notifications will appear here."
            />
          )}
        </CardContent>
      </Card>
    </section>
  );
}

import { BellRing, CheckCheck } from "lucide-react";

import EmptyState from "@/components/employee-portal/EmptyState";
import NotificationList from "@/components/employee-portal/NotificationList";
import PageHeader from "@/components/employee-portal/PageHeader";
import StatCard from "@/components/hr/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireEmployeePage } from "@/lib/handler/require-employee";
import { getEmployeeNotifications } from "@/lib/queries/employee-portal/employee-portal.communications";

export default async function EmployeeNotificationsPage(): Promise<
  React.JSX.Element
> {
  const { userId } = await requireEmployeePage();
  const { notifications, total, unread } =
    await getEmployeeNotifications(userId);

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
          dashboardValue={unread}
          icon={BellRing}
        />
        <StatCard
          label="Recent notifications"
          dashboardValue={total}
          icon={CheckCheck}
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length ? (
            <NotificationList notifications={notifications} />
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

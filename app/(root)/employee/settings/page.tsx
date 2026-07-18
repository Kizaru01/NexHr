import { BellRing, Camera, MailCheck } from "lucide-react";
import { notFound } from "next/navigation";

import NotificationPreferencesForm from "@/components/employee-portal/NotificationPreferencesForm";
import PageHeader from "@/components/employee-portal/PageHeader";
import ProfileImageForm from "@/components/employee-portal/ProfileImageForm";
import StatCard from "@/components/hr/StatCard";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireEmployeePage } from "@/lib/handler/require-employee";
import { getOwnEmployeeProfile } from "@/queries/employee-portal.profile";

export default async function EmployeeSettingsPage() {
  const employee = await requireEmployeePage();
  const profile = await getOwnEmployeeProfile(
    employee.employeeDatabaseId,
    employee.userId
  );
  if (!profile) notFound();
  const enabledNotifications = Object.values(profile.notification).filter(
    Boolean
  ).length;

  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <PageHeader
        eyebrow="My preferences"
        title="Settings"
        description="Choose how you receive employee updates and keep your profile image current."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Active notification types"
          value={`${enabledNotifications}/5`}
          icon={BellRing}
        />
        <StatCard
          label="Email delivery"
          value={profile.notification.email ? "Enabled" : "Disabled"}
          icon={MailCheck}
        />
        <StatCard
          label="Profile image"
          value={profile.avatar ? "Uploaded" : "Not set"}
          icon={Camera}
        />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profile picture</CardTitle>
            <CardDescription>
              Use a recent image so teammates can recognize you.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileImageForm avatar={profile.avatar} name={profile.fullName} />
          </CardContent>
        </Card>
        <NotificationPreferencesForm preferences={profile.notification} />
      </div>
    </section>
  );
}

import { HeartPulse, IdCard, MapPin, UserRound } from "lucide-react";
import { notFound } from "next/navigation";

import DetailList from "@/components/employee-portal/DetailList";
import OwnProfileForm from "@/components/employee-portal/OwnProfileForm";
import PageHeader from "@/components/employee-portal/PageHeader";
import ProfileImageForm from "@/components/employee-portal/ProfileImageForm";
import StatusBadge from "@/components/hr/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireEmployeePage } from "@/lib/handler/require-employee";
import { getOwnEmployeeProfile } from "@/lib/queries/employee-portal/employee-portal.profile";
import { formatDisplayDate } from "@/lib/utils";

export default async function EmployeeProfilePage(): Promise<
  React.JSX.Element
> {
  const { employeeDatabaseId, userId } = await requireEmployeePage();
  const profile = await getOwnEmployeeProfile(
    employeeDatabaseId,
    userId
  );
  if (!profile) notFound();
  const { address, emergencyContact } = profile;

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <PageHeader
        eyebrow="My profile"
        title="Personal information"
        description="Keep your contact details and emergency information current. Employment details are maintained by HR."
      />

      <Card>
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <ProfileImageForm avatar={profile.avatar} name={profile.fullName} />
          <div className="min-w-0 sm:text-right">
            <p className="text-sm text-muted-foreground">
              {profile.employeeId}
            </p>
            <h2 className="mt-1 text-2xl font-bold">{profile.fullName}</h2>
            <p className="mt-1 text-muted-foreground">
              {profile.position} · {profile.department}
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IdCard className="size-4" /> Employment information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList
              details={[
                { label: "Employee ID", value: profile.employeeId },
                { label: "Department", value: profile.department },
                { label: "Position", value: profile.position },
                { label: "Manager", value: profile.manager },
                {
                  label: "Hire date",
                  value: formatDisplayDate(profile.hireDate, "Not provided"),
                },
                { label: "Employment type", value: profile.type },
                {
                  label: "Employment status",
                  value: <StatusBadge status={profile.status} />,
                },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserRound className="size-4" /> Profile access
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              You are viewing your employee record. Your employee ID and
              employment information are read-only.
            </p>
            <p>
              Personal, address, emergency contact, and profile image fields can
              be updated according to company policy.
            </p>
          </CardContent>
        </Card>
      </div>

      <OwnProfileForm profile={profile} />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="size-4" /> Address summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList
              details={[
                { label: "Street", value: address?.street },
                { label: "Barangay", value: address?.barangay },
                { label: "City", value: address?.city },
                { label: "Province", value: address?.province },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HeartPulse className="size-4" /> Emergency contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <DetailList
              details={[
                { label: "Name", value: emergencyContact?.name },
                {
                  label: "Relationship",
                  value: emergencyContact?.relationship,
                },
                { label: "Phone", value: emergencyContact?.phone },
              ]}
            />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

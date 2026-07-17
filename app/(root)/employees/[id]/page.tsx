import Link from "next/link";
import {
  ArrowLeft,
  Building2,
  HeartPulse,
  MapPin,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { notFound } from "next/navigation";
import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";
import { getEmployeeProfile } from "@/queries/hr-dashboard.queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import StatusBadge from "@/components/hr/StatusBadge";
type PageProps = { params: Promise<{ id: string }> };
const value = (item?: string | null) => item || "Not provided";
function ProfileSection({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof UserRound;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Icon className="size-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        {children}
      </CardContent>
    </Card>
  );
}
function Detail({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <div className="mt-1 font-medium">{children}</div>
    </div>
  );
}
export default async function EmployeeProfilePage({ params }: PageProps) {
  await requireHrAdminPage();

  const { id } = await params;
  const employee = await getEmployeeProfile(id);
  if (!employee) notFound();
  return (
    <section className="mx-auto max-w-5xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/employees">
          <ArrowLeft /> Back to employees
        </Link>
      </Button>
      <Card>
        <CardContent className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-primary/10 text-xl font-bold text-primary">
            {employee.name
              .split(" ")
              .map((part) => part[0])
              .join("")
              .slice(0, 2)}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {employee.employeeId}
            </p>
            <h1 className="text-3xl font-bold">{employee.name}</h1>
            <p className="mt-1 text-muted-foreground">
              {employee.position} · {employee.department}
            </p>
          </div>
          <StatusBadge status={employee.status} />
        </CardContent>
      </Card>
      <div className="grid gap-6 lg:grid-cols-2">
        <ProfileSection title="Personal information" icon={UserRound}>
          <Detail label="Email">{employee.email}</Detail>
          <Detail label="Phone">{value(employee.phone)}</Detail>
          <Detail label="Gender">{value(employee.gender)}</Detail>
          <Detail label="Birth date">
            {employee.birthDate
              ? new Date(employee.birthDate).toLocaleDateString()
              : "Not provided"}
          </Detail>
        </ProfileSection>
        <ProfileSection title="Employment information" icon={Building2}>
          <Detail label="Department">{employee.department}</Detail>
          <Detail label="Position">{employee.position}</Detail>
          <Detail label="Employment type">{employee.type}</Detail>
          <Detail label="Manager">{employee.manager}</Detail>
          <Detail label="Hire date">
            {employee.hireDate
              ? new Date(employee.hireDate).toLocaleDateString()
              : "Not provided"}
          </Detail>
          <Detail label="Status">
            <StatusBadge status={employee.status} />
          </Detail>
        </ProfileSection>
        <ProfileSection title="Address" icon={MapPin}>
          <Detail label="Street">{value(employee.address?.street)}</Detail>
          <Detail label="City">{value(employee.address?.city)}</Detail>
          <Detail label="Province">{value(employee.address?.province)}</Detail>
          <Detail label="Postal code">
            {value(employee.address?.postalCode)}
          </Detail>
        </ProfileSection>
        <ProfileSection title="Emergency contact" icon={HeartPulse}>
          <Detail label="Name">{value(employee.emergencyContact?.name)}</Detail>
          <Detail label="Relationship">
            {value(employee.emergencyContact?.relationship)}
          </Detail>
          <Detail label="Phone">
            {value(employee.emergencyContact?.phone)}
          </Detail>
        </ProfileSection>
        <ProfileSection title="System information" icon={ShieldCheck}>
          <Detail label="Record created">
            {employee.createdAt
              ? new Date(employee.createdAt).toLocaleString()
              : "—"}
          </Detail>
          <Detail label="Last updated">
            {employee.updatedAt
              ? new Date(employee.updatedAt).toLocaleString()
              : "—"}
          </Detail>
          <Detail label="Notes">{value(employee.notes)}</Detail>
        </ProfileSection>
      </div>
    </section>
  );
}

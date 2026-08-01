import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft, Building2, Mail, ShieldCheck, UserRound } from "lucide-react";

import ConcernInternalNotes from "@/components/concerns/ConcernInternalNotes";
import ConcernLetter from "@/components/concerns/ConcernLetter";
import ConcernOpenTracker from "@/components/concerns/ConcernOpenTracker";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";
import { getConcernDetail } from "@/lib/queries/concern.queries";

type PageProps = {
  params: Promise<{ id: string }>;
};

function formatDateTime(value: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function HrConcernDetailPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  await requireHrAdminPage();
  const { id } = await params;
  const concern = await getConcernDetail({ idOrCaseNumber: id, role: "hr" });

  if (!concern) notFound();

  return (
    <section className="space-y-6">
      <ConcernOpenTracker concernId={concern.id} />

      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href="/employee-concerns">
            <ArrowLeft />
            Back to concern inbox
          </Link>
        </Button>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <span className="font-mono text-xs font-semibold text-primary">
              {concern.caseNumber}
            </span>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.025em] md:text-3xl">
              {concern.subject}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {concern.category} · Submitted {formatDateTime(concern.submittedAt)}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-card px-3.5 py-2.5 shadow-[var(--shadow-card)]">
            <ShieldCheck className="size-4 text-success" />
            <div>
              <p className="text-xs font-semibold">Confidential</p>
              <p className="text-[0.6875rem] text-muted-foreground">
                HR & admin only
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <ConcernLetter
          attachments={concern.attachments}
          message={concern.message}
        />

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Employee information</CardTitle>
              <CardDescription>Submitted by</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <Image
                  src={concern.avatar ?? "/avatar1.png"}
                  alt=""
                  width={44}
                  height={44}
                  className="size-11 rounded-full object-cover"
                />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{concern.employee}</p>
                  <p className="font-mono text-xs text-muted-foreground">
                    {concern.employeeId}
                  </p>
                </div>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <Mail className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <dt className="text-xs text-muted-foreground">Email</dt>
                    <dd className="truncate font-medium">
                      {concern.employeeEmail || "—"}
                    </dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Building2 className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Department</dt>
                    <dd className="font-medium">{concern.department}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <UserRound className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <dt className="text-xs text-muted-foreground">Position</dt>
                    <dd className="font-medium">{concern.employeePosition}</dd>
                  </div>
                </div>
              </dl>
            </CardContent>
          </Card>

          <ConcernInternalNotes concernId={concern.id} notes={concern.notes} />
        </aside>
      </div>
    </section>
  );
}

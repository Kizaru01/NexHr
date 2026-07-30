import Link from "next/link";
import { notFound } from "next/navigation";

import {
  ArrowLeft,
  CalendarDays,
  MessageSquareHeart,
  Paperclip,
  ShieldCheck,
} from "lucide-react";

import {
  ConcernPriorityBadge,
  ConcernStatusBadge,
} from "@/components/concerns/ConcernBadges";
import ConcernLetter from "@/components/concerns/ConcernLetter";
import ConcernOpenTracker from "@/components/concerns/ConcernOpenTracker";
import ConcernTimeline from "@/components/concerns/ConcernTimeline";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireEmployeePage } from "@/lib/handler/require-employee";
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

export default async function EmployeeConcernDetailPage({
  params,
}: PageProps): Promise<React.JSX.Element> {
  const { employeeDatabaseId } = await requireEmployeePage();
  const { id } = await params;
  const concern = await getConcernDetail({
    employeeId: employeeDatabaseId,
    idOrCaseNumber: id,
    role: "employee",
  });

  if (!concern) notFound();

  return (
    <section className="space-y-6">
      <ConcernOpenTracker concernId={concern.id} />

      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href="/employee/concerns">
            <ArrowLeft />
            Back to my concerns
          </Link>
        </Button>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs font-semibold text-primary">
                {concern.caseNumber}
              </span>
              <ConcernStatusBadge status={concern.status} />
              <ConcernPriorityBadge priority={concern.priority} />
            </div>
            <h1 className="mt-3 text-2xl font-semibold tracking-[-0.025em] md:text-3xl">
              {concern.subject}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {concern.category} · Submitted{" "}
              {formatDateTime(concern.submittedAt)}
            </p>
          </div>
        </div>
      </div>

      {concern.status === "Resolved" ? (
        <div className="flex gap-3 rounded-xl border border-success/20 bg-success-soft p-4">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-success" />
          <div>
            <p className="font-semibold text-success-foreground">
              HR marked this concern as resolved
            </p>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              The status and complete handling history remain available below
              for your records.
            </p>
          </div>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <ConcernLetter
          attachments={concern.attachments}
          message={concern.message}
        />

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquareHeart className="size-4 text-primary" />
                Case summary
              </CardTitle>
              <CardDescription>
                Your case stays visible here through closure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-xs text-muted-foreground">Category</dt>
                  <dd className="mt-1 font-medium">{concern.category}</dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Attachments
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-semibold">
                    <Paperclip className="size-3.5" />
                    {concern.attachmentCount}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs text-muted-foreground">
                    Last activity
                  </dt>
                  <dd className="mt-1 flex items-center gap-1.5 font-medium">
                    <CalendarDays className="size-3.5" />
                    {formatDateTime(concern.lastActivityAt)}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>

          <ConcernTimeline history={concern.history} />
        </aside>
      </div>
    </section>
  );
}

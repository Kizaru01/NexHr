import Link from "next/link";
import { notFound } from "next/navigation";

import { ArrowLeft } from "lucide-react";

import ConcernLetter from "@/components/concerns/ConcernLetter";
import { Button } from "@/components/ui/button";
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
      <div>
        <Button asChild variant="ghost" size="sm" className="-ml-3">
          <Link href="/employee/concerns">
            <ArrowLeft />
            Back to my concerns
          </Link>
        </Button>
        <div className="mt-4">
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
      </div>

      <ConcernLetter
        attachments={concern.attachments}
        message={concern.message}
      />
    </section>
  );
}

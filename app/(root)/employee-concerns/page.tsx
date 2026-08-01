import Image from "next/image";
import Link from "next/link";

import { ArrowUpRight, Inbox, ShieldCheck } from "lucide-react";

import Pagination from "@/components/hr/Pagination";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";
import { getHrConcernDashboard } from "@/lib/queries/concern.queries";
import { normaliseSearchParams } from "@/lib/search-params";
import type { PageSearchParams } from "@/types/filters";

type PageProps = {
  searchParams: Promise<PageSearchParams>;
};

function formatDateTime(value: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function EmployeeConcernsManagementPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  await requireHrAdminPage();

  const parameters = normaliseSearchParams(await searchParams);
  const { concerns, page, total, totalPages } =
    await getHrConcernDashboard(parameters);

  return (
    <section className="space-y-6">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Employee relations</p>
          <h1 className="heading-1">Employee concerns</h1>
          <p className="page-description">
            Review private letters submitted by employees. Unread concerns
            always appear first.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl border bg-card px-3.5 py-2.5 shadow-[var(--shadow-card)]">
          <ShieldCheck className="size-4 text-success" />
          <div>
            <p className="text-xs font-semibold">Restricted workspace</p>
            <p className="text-[0.6875rem] text-muted-foreground">
              HR & admin access only
            </p>
          </div>
        </div>
      </div>

      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle>Concern inbox</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "concern" : "concerns"}
          </CardDescription>
        </CardHeader>

        <div className="overflow-x-auto">
          <table className="w-full min-w-250 text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                {["Employee", "Case", "Subject", "Category", "Submitted", ""].map(
                  (heading) => (
                    <th key={heading} className="px-4 py-3 font-medium">
                      {heading}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {concerns.map((concern) => (
                <tr
                  key={concern.id}
                  className={concern.isNew ? "border-t bg-primary/[0.035]" : "border-t"}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Image
                        src={concern.avatar ?? "/avatar1.png"}
                        alt=""
                        width={36}
                        height={36}
                        className="size-9 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="max-w-48 truncate font-semibold">
                          {concern.employee}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {concern.employeeId} · {concern.department}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-primary">
                        {concern.caseNumber}
                      </span>
                      {concern.isNew ? (
                        <span className="rounded-full bg-primary px-2 py-0.5 text-[0.625rem] font-semibold text-primary-foreground">
                          New
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-72 truncate font-medium">
                      {concern.subject}
                    </p>
                    <p className="mt-0.5 max-w-72 truncate text-xs text-muted-foreground">
                      {concern.message}
                    </p>
                  </td>
                  <td className="px-4 py-3">{concern.category}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateTime(concern.submittedAt)}
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/employee-concerns/${concern.id}`}
                      aria-label={`Open ${concern.caseNumber}`}
                      className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-primary-soft hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ArrowUpRight className="size-4" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!concerns.length ? (
          <div className="p-12 text-center">
            <div className="mx-auto flex size-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Inbox className="size-5" />
            </div>
            <h2 className="mt-4 font-semibold">No employee concerns</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              New submissions will appear here automatically.
            </p>
          </div>
        ) : null}

        <Pagination
          page={page}
          totalPages={totalPages}
          parameters={parameters}
        />
      </Card>
    </section>
  );
}

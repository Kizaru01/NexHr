import Link from "next/link";

import { ArrowRight, MessageSquareHeart } from "lucide-react";

import ConcernComposer from "@/components/concerns/ConcernComposer";
import EmptyState from "@/components/employee-portal/EmptyState";
import PageHeader from "@/components/employee-portal/PageHeader";
import Pagination from "@/components/hr/Pagination";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireEmployeePage } from "@/lib/handler/require-employee";
import { getEmployeeConcernList } from "@/lib/queries/concern.queries";
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

export default async function EmployeeConcernsPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  const { employeeDatabaseId } = await requireEmployeePage();
  const parameters = normaliseSearchParams(await searchParams);
  const { concerns, page, total, totalPages } = await getEmployeeConcernList(
    employeeDatabaseId,
    parameters
  );

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Private support"
        title="Employee concerns"
        description="Write privately to HR and keep a copy of every concern you submit."
      />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,.65fr)]">
        <Card className="order-2 gap-0 xl:order-1">
          <CardHeader className="border-b">
            <CardTitle>Your submitted concerns</CardTitle>
            <CardDescription>
              {total} {total === 1 ? "concern" : "concerns"} · newest first
            </CardDescription>
          </CardHeader>
          {concerns.length ? (
            <div className="divide-y">
              {concerns.map((concern) => (
                <Link
                  key={concern.id}
                  href={`/employee/concerns/${concern.id}`}
                  className="group block px-5 py-4 outline-none transition-colors hover:bg-muted/45 focus-visible:bg-muted/45"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <span className="font-mono text-xs font-semibold text-primary">
                        {concern.caseNumber}
                      </span>
                      <h2 className="mt-2 font-semibold tracking-[-0.01em] group-hover:text-primary">
                        {concern.subject}
                      </h2>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {concern.message}
                      </p>
                      <div className="mt-2.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                        <span>{concern.category}</span>
                        {concern.attachmentCount ? (
                          <>
                            <span>·</span>
                            <span>{concern.attachmentCount} attachments</span>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-between gap-3 sm:block sm:text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDateTime(concern.submittedAt)}
                      </p>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:mt-3 sm:ml-auto" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No concerns submitted"
              description="Your submitted letters will appear here."
              icon={MessageSquareHeart}
            />
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            parameters={parameters}
          />
        </Card>

        <Card className="order-1 border-primary/20 xl:order-2">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MessageSquareHeart className="size-5" />
            </div>
            <CardTitle>Write to HR</CardTitle>
            <CardDescription>
              Submit a private concern letter with optional supporting files.
            </CardDescription>
            <CardAction>
              <span className="rounded-full bg-success-soft px-2.5 py-1 text-xs font-semibold text-success-foreground">
                Secure
              </span>
            </CardAction>
          </CardHeader>
          <CardContent>
            <ConcernComposer />
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

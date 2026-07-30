import Link from "next/link";

import {
  ArrowRight,
  CheckCircle2,
  CircleDot,
  Clock3,
  Inbox,
  MessageSquareHeart,
} from "lucide-react";

import ConcernComposer from "@/components/concerns/ConcernComposer";
import {
  ConcernPriorityBadge,
  ConcernStatusBadge,
} from "@/components/concerns/ConcernBadges";
import EmptyState from "@/components/employee-portal/EmptyState";
import PageHeader from "@/components/employee-portal/PageHeader";
import FilterToolbar from "@/components/hr/filters/FilterToolbar";
import Pagination from "@/components/hr/Pagination";
import StatCard from "@/components/hr/StatCard";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { concernStatusOptions } from "@/constants/concerns";
import { requireEmployeePage } from "@/lib/handler/require-employee";
import { getEmployeeConcernList } from "@/lib/queries/concern.queries";
import { normaliseSearchParams } from "@/lib/search-params";
import type { FilterControl, PageSearchParams } from "@/types/filters";

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
  const filters = normaliseSearchParams(await searchParams);
  const { concerns, page, stats, total, totalPages } =
    await getEmployeeConcernList(employeeDatabaseId, filters);
  const filterControls: readonly FilterControl[] = [
    {
      type: "search",
      key: "search",
      placeholder: "Search subject or case number",
      ariaLabel: "Search your concerns",
      className: "md:w-80",
    },
    {
      type: "select",
      key: "status",
      label: "Status",
      emptyLabel: "All statuses",
      options: concernStatusOptions,
    },
  ];

  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Private support"
        title="Employee concerns"
        description="A secure, trackable channel for questions or workplace matters that need HR attention."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="All concerns" value={stats.total} icon={Inbox} />
        <StatCard
          label="In review"
          value={stats.inReview}
          icon={Clock3}
        />
        <StatCard
          label="In progress"
          value={stats.inProgress}
          icon={CircleDot}
        />
        <StatCard
          label="Resolved"
          value={stats.resolved}
          icon={CheckCircle2}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.35fr)_minmax(22rem,.65fr)]">
        <Card className="order-2 gap-0 xl:order-1">
          <CardHeader className="border-b">
            <CardTitle>Submitted concerns</CardTitle>
            <CardDescription>
              {total} {total === 1 ? "case" : "cases"} · newest activity first
            </CardDescription>
          </CardHeader>
          <CardContent className="border-b py-4">
            <FilterToolbar controls={filterControls} />
          </CardContent>
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
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono text-xs font-semibold text-primary">
                          {concern.caseNumber}
                        </span>
                        <ConcernStatusBadge status={concern.status} />
                        <ConcernPriorityBadge priority={concern.priority} />
                      </div>
                      <h2 className="mt-2.5 font-semibold tracking-[-0.01em] group-hover:text-primary">
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
                        Updated {formatDateTime(concern.lastActivityAt)}
                      </p>
                      <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary sm:mt-3 sm:ml-auto" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No concerns found"
              description={
                filters.search || filters.status
                  ? "Try adjusting the search or status filter."
                  : "When you contact HR, your concern and every update will appear here."
              }
              icon={MessageSquareHeart}
            />
          )}
          <Pagination
            page={page}
            totalPages={totalPages}
            parameters={filters}
          />
        </Card>

        <Card className="order-1 border-primary/20 xl:order-2">
          <CardHeader>
            <div className="mb-2 flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <MessageSquareHeart className="size-5" />
            </div>
            <CardTitle>Write to HR</CardTitle>
            <CardDescription>
              Submit a private concern letter and track its status as HR
              reviews it.
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

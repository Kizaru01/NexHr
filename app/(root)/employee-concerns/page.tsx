import Image from "next/image";
import Link from "next/link";

import {
  ArrowUpRight,
  CheckCircle2,
  CircleDot,
  Inbox,
  MessageSquareWarning,
  ShieldCheck,
} from "lucide-react";

import {
  ConcernPriorityBadge,
  ConcernStatusBadge,
} from "@/components/concerns/ConcernBadges";
import FilterToolbar from "@/components/hr/filters/FilterToolbar";
import Pagination from "@/components/hr/Pagination";
import StatCard from "@/components/hr/StatCard";
import UrlFilterSelect from "@/components/hr/filters/UrlFilterSelect";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  concernCategoryOptions,
  concernPriorityOptions,
  concernSortOptions,
  concernStatusOptions,
} from "@/constants/concerns";
import { requireHrAdminPage } from "@/lib/handler/require-hr-admin";
import { getHrConcernDashboard } from "@/lib/queries/concern.queries";
import { getEmployeeFilters } from "@/lib/queries/hr-dashboard.queries";
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

export default async function EmployeeConcernsManagementPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  await requireHrAdminPage();

  const filters = normaliseSearchParams(await searchParams);
  const [{ concerns, page, stats, total, totalPages }, options] =
    await Promise.all([
      getHrConcernDashboard(filters),
      getEmployeeFilters(),
    ]);
  const filterControls: readonly FilterControl[] = [
    {
      type: "search",
      key: "search",
      placeholder: "Search employee, case, or subject",
      ariaLabel: "Search employee concerns",
      className: "md:w-80",
    },
    {
      type: "select",
      key: "department",
      label: "Department",
      emptyLabel: "All departments",
      options: options.departments,
    },
    {
      type: "select",
      key: "category",
      label: "Category",
      emptyLabel: "All categories",
      options: concernCategoryOptions,
      className: "md:w-60",
    },
    {
      type: "select",
      key: "status",
      label: "Status",
      emptyLabel: "All statuses",
      options: concernStatusOptions,
    },
    {
      type: "select",
      key: "priority",
      label: "Priority",
      emptyLabel: "All priorities",
      options: concernPriorityOptions,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Employee relations</p>
          <h1 className="heading-1">Employee concerns</h1>
          <p className="page-description">
            Triage confidential submissions, collaborate with employees, and
            keep every response and decision accountable.
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Total concerns" value={stats.total} icon={Inbox} />
        <StatCard
          label="New"
          value={stats.new}
          icon={MessageSquareWarning}
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
        <StatCard label="Closed" value={stats.closed} icon={ShieldCheck} />
      </div>

      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle>Concern queue</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "concern" : "concerns"} match this view
          </CardDescription>
          <CardAction>
            <UrlFilterSelect
              field="sort"
              label="Sort concerns"
              options={concernSortOptions}
              defaultValue="activity-desc"
              className="w-48"
            />
          </CardAction>
        </CardHeader>
        <CardContent className="border-b py-4">
          <FilterToolbar controls={filterControls} />
        </CardContent>

        <div className="overflow-x-auto">
          <table className="w-full min-w-350 text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                {[
                  "Employee",
                  "Case",
                  "Subject",
                  "Category",
                  "Status",
                  "Priority",
                  "Submitted",
                  "Last updated",
                  "",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-medium">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {concerns.map((concern) => (
                <tr key={concern.id} className="border-t">
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
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-primary">
                    {concern.caseNumber}
                  </td>
                  <td className="px-4 py-3">
                    <p className="max-w-64 truncate font-medium">
                      {concern.subject}
                    </p>
                    <p className="mt-0.5 max-w-64 truncate text-xs text-muted-foreground">
                      {concern.message}
                    </p>
                  </td>
                  <td className="px-4 py-3">{concern.category}</td>
                  <td className="px-4 py-3">
                    <ConcernStatusBadge status={concern.status} />
                  </td>
                  <td className="px-4 py-3">
                    <ConcernPriorityBadge priority={concern.priority} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateTime(concern.submittedAt)}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDateTime(concern.lastActivityAt)}
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
            <h2 className="mt-4 font-semibold">No concerns match this view</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Adjust the filters or search to broaden the queue.
            </p>
          </div>
        ) : null}

        <Pagination
          page={page}
          totalPages={totalPages}
          parameters={filters}
        />
      </Card>
    </section>
  );
}

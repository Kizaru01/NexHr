import Link from "next/link";
import { ArrowRight, BellRing, Megaphone, Sparkles } from "lucide-react";

import EmptyState from "@/components/employee-portal/EmptyState";
import PageHeader from "@/components/employee-portal/PageHeader";
import FilterToolbar from "@/components/hr/filters/FilterToolbar";
import Pagination from "@/components/hr/Pagination";
import StatCard from "@/components/hr/StatCard";
import StatusBadge from "@/components/hr/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireEmployeePage } from "@/lib/handler/require-employee";
import { normaliseSearchParams } from "@/lib/search-params";
import { getEmployeeAnnouncements } from "@/lib/queries/employee-portal/employee-portal.communications";
import type { FilterControl, PageSearchParams } from "@/types/filters";

type PageProps = { searchParams: Promise<PageSearchParams> };
const controls: readonly FilterControl[] = [
  {
    type: "search",
    key: "search",
    placeholder: "Search announcements",
    ariaLabel: "Search announcements",
  },
  {
    type: "select",
    key: "category",
    label: "Category",
    emptyLabel: "All categories",
    options: ["Company", "People", "Policy", "Benefits", "Events"].map(
      (value) => ({ value, label: value })
    ),
  },
];

export default async function EmployeeAnnouncementsPage({
  searchParams,
}: PageProps): Promise<React.JSX.Element> {
  await requireEmployeePage();
  const filters = normaliseSearchParams(await searchParams);
  const results = await getEmployeeAnnouncements(filters);
  return (
    <section className="space-y-6">
      <PageHeader
        eyebrow="Company news"
        title="Announcements"
        description="Stay informed about company updates, policies, benefits, and events."
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard
          label="Published announcements"
          dashboardValue={results.stats.total}
          icon={Megaphone}
        />
        <StatCard
          label="High priority"
          dashboardValue={results.stats.highPriority}
          icon={BellRing}
        />
        <StatCard label="Categories" value="5" icon={Sparkles} />
      </div>
      <Card className="gap-0">
        <CardContent className="border-b py-4">
          <FilterToolbar controls={controls} />
        </CardContent>
        <CardHeader>
          <CardTitle>Latest announcements</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {results.announcements.length ? (
            results.announcements.map((announcement) => (
              <article
                key={announcement.id}
                className="flex min-h-52 flex-col rounded-xl border p-5"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold text-primary">
                    {announcement.category}
                  </p>
                  <StatusBadge status={announcement.priority} />
                </div>
                <h2 className="mt-3 text-base font-semibold">
                  {announcement.title}
                </h2>
                <p className="mt-2 line-clamp-4 text-sm text-muted-foreground">
                  {announcement.description}
                </p>
                <Link
                  href={`/employee/announcements/${announcement.id}`}
                  className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                >
                  Read announcement <ArrowRight className="size-4" />
                </Link>
                <p className="mt-auto pt-4 text-xs text-muted-foreground">
                  {announcement.publishedAt
                    ? new Date(announcement.publishedAt).toLocaleDateString()
                    : "—"}
                </p>
              </article>
            ))
          ) : (
            <div className="md:col-span-2 xl:col-span-3">
              <EmptyState
                title="No announcements found"
                description="Try a different search or category."
              />
            </div>
          )}
        </CardContent>
        <Pagination
          page={results.page}
          totalPages={results.totalPages}
          parameters={filters}
        />
      </Card>
    </section>
  );
}

import Link from "next/link";
import { BellRing, FileText, Megaphone, Pencil, Plus } from "lucide-react";

import {
  announcementCategoryOptions,
  announcementPriorityOptions,
  announcementSortOptions,
  announcementStateOptions,
} from "@/constants/filter-options";
import FilterToolbar from "@/components/hr/filters/FilterToolbar";
import ArchiveAnnouncementButton from "@/components/announcements/ArchiveAnnouncementButton";
import DeleteAnnouncementButton from "@/components/announcements/DeleteAnnouncementButton";
import UrlFilterSelect from "@/components/hr/filters/UrlFilterSelect";
import Pagination from "@/components/hr/Pagination";
import StatCard from "@/components/hr/StatCard";
import StatusBadge from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { normaliseSearchParams } from "@/lib/search-params";
import { getAnnouncementDashboard } from "@/lib/queries/hr-dashboard.queries";
import type { FilterControl, PageSearchParams } from "@/types/filters";

type PageProps = { searchParams: Promise<PageSearchParams> };

function formatDate(value: string | null): string {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "medium" }).format(
        new Date(value)
      )
    : "—";
}

export default async function AnnouncementsPage({ searchParams }: PageProps): Promise<React.JSX.Element> {
  const filters = normaliseSearchParams(await searchParams);
  const { announcements, stats, page, totalPages, total } =
    await getAnnouncementDashboard(filters);
  const filterControls: readonly FilterControl[] = [
    {
      type: "search",
      key: "search",
      placeholder: "Search title or message",
      ariaLabel: "Search announcements",
      className: "md:w-80",
    },
    {
      type: "select",
      key: "category",
      label: "Category",
      emptyLabel: "All categories",
      options: announcementCategoryOptions,
    },
    {
      type: "select",
      key: "priority",
      label: "Priority",
      emptyLabel: "All priorities",
      options: announcementPriorityOptions,
    },
    {
      type: "select",
      key: "state",
      label: "Publication state",
      emptyLabel: "All states",
      options: announcementStateOptions,
    },
  ];

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Company communications</p>
          <h1 className="text-3xl font-bold tracking-tight">Announcements</h1>
          <p className="mt-1 text-muted-foreground">
            Publish and manage company updates for your workforce.
          </p>
        </div>
        <Button asChild>
          <Link href="/announcements/create">
            <Plus /> Create announcement
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Published" value={String(stats.published)} icon={Megaphone} />
        <StatCard label="Drafts" value={String(stats.drafts)} icon={FileText} />
        <StatCard label="High priority" value={String(stats.highPriority)} icon={BellRing} />
      </div>

      <Card className="gap-0">
        <CardHeader className="border-b">
          <CardTitle>Announcement library</CardTitle>
          <CardDescription>
            {total} {total === 1 ? "announcement" : "announcements"}
          </CardDescription>
          <CardAction>
            <UrlFilterSelect
              field="sort"
              label="Sort announcements"
              options={announcementSortOptions}
              defaultValue="newest"
              className="w-48"
            />
          </CardAction>
        </CardHeader>
        <CardContent className="border-b py-4">
          <FilterToolbar controls={filterControls} />
        </CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-250 text-sm">
            <thead className="bg-muted/50 text-left text-xs uppercase text-muted-foreground">
              <tr>
                {["Announcement", "Category", "Priority", "State", "Published", "Created", ""].map((heading) => (
                  <th key={heading} className="px-4 py-3 font-medium">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {announcements.map((announcement) => (
                <tr key={announcement.id} className="border-t transition-colors hover:bg-muted/40">
                  <td className="max-w-md px-4 py-3">
                    <p className="font-semibold">{announcement.title}</p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground" title={announcement.description}>
                      {announcement.description}
                    </p>
                  </td>
                  <td className="px-4 py-3">{announcement.category}</td>
                  <td className="px-4 py-3"><StatusBadge status={announcement.priority} /></td>
                  <td className="px-4 py-3"><StatusBadge status={announcement.state} /></td>
                  <td className="px-4 py-3">{formatDate(announcement.publishedAt)}</td>
                  <td className="px-4 py-3">{formatDate(announcement.createdAt)}</td>
                  <td className="px-4 py-3 text-right">
                    {!announcement.isArchived ? (
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/announcements/${announcement.id}/edit`}>
                            <Pencil /> Edit
                          </Link>
                        </Button>
                        <ArchiveAnnouncementButton
                          announcementId={announcement.id}
                          title={announcement.title}
                        />
                        {!announcement.isPublished && (
                          <DeleteAnnouncementButton
                            announcementId={announcement.id}
                            title={announcement.title}
                          />
                        )}
                      </div>
                    ) : (
                      <div className="flex justify-end gap-1">
                        <DeleteAnnouncementButton
                          announcementId={announcement.id}
                          title={announcement.title}
                        />
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {announcements.length === 0 && (
          <p className="p-10 text-center text-muted-foreground">
            No announcements match these filters.
          </p>
        )}
        <Pagination page={page} totalPages={totalPages} parameters={filters} />
      </Card>
    </section>
  );
}

import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";
import { notFound } from "next/navigation";

import PageHeader from "@/components/employee-portal/PageHeader";
import StatusBadge from "@/components/hr/StatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireEmployeePage } from "@/lib/handler/require-employee";
import { getEmployeeAnnouncementDetail } from "@/lib/queries/employee-portal/employee-portal.communications";

type PageProps = { params: Promise<{ id: string }> };

function formatDate(value: string | null): string {
  return value
    ? new Intl.DateTimeFormat("en", { dateStyle: "long" }).format(
        new Date(value)
      )
    : "—";
}

export default async function EmployeeAnnouncementDetailPage({ params }: PageProps): Promise<React.JSX.Element> {
  await requireEmployeePage();
  const { id } = await params;
  const announcement = await getEmployeeAnnouncementDetail(id);

  if (!announcement) {
    notFound();
  }

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/employee/announcements">
          <ArrowLeft /> Back to announcements
        </Link>
      </Button>
      <PageHeader
        eyebrow={announcement.category}
        title={announcement.title}
        description={`Published ${formatDate(announcement.publishedAt)}`}
        actions={<StatusBadge status={announcement.priority} />}
      />
      <Card>
        <CardContent className="space-y-6 pt-6">
          <p className="whitespace-pre-wrap leading-7 text-muted-foreground">
            {announcement.description}
          </p>
          <div className="flex items-center gap-2 border-t pt-5 text-sm text-muted-foreground">
            <CalendarDays className="size-4" />
            Published {formatDate(announcement.publishedAt)}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";

import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getAnnouncementForEditing } from "@/lib/queries/hr-dashboard.queries";

type PageProps = { params: Promise<{ id: string }> };

export default async function EditAnnouncementPage({ params }: PageProps): Promise<React.JSX.Element> {
  const { id } = await params;
  const announcement = await getAnnouncementForEditing(id);
  if (!announcement) notFound();

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/announcements">
          <ArrowLeft /> Back to announcements
        </Link>
      </Button>
      <div>
        <p className="text-sm font-medium text-primary">Company communications</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Edit announcement</h1>
        <p className="mt-2 text-muted-foreground">
          Update the message, audience-facing priority, or publication state.
        </p>
      </div>
      <Card>
        <CardContent>
          <AnnouncementForm announcement={announcement} />
        </CardContent>
      </Card>
    </section>
  );
}

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
        <p className="page-eyebrow">Company communications</p>
        <h1 className="heading-1">Edit announcement</h1>
        <p className="page-description">
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

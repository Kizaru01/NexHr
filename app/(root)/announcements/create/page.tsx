import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import AnnouncementForm from "@/components/announcements/AnnouncementForm";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function CreateAnnouncementPage(): React.JSX.Element {
  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/announcements">
          <ArrowLeft /> Back to announcements
        </Link>
      </Button>
      <div>
        <p className="page-eyebrow">Company communications</p>
        <h1 className="heading-1">Create announcement</h1>
        <p className="page-description">
          Share timely company, people, policy, benefits, or event updates.
        </p>
      </div>
      <Card>
        <CardContent>
          <AnnouncementForm />
        </CardContent>
      </Card>
    </section>
  );
}

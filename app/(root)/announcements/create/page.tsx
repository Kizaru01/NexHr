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
        <p className="text-sm font-medium text-primary">Company communications</p>
        <h1 className="mt-1 text-3xl font-bold tracking-tight">Create announcement</h1>
        <p className="mt-2 text-muted-foreground">
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

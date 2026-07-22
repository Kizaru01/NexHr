"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Archive } from "lucide-react";
import { toast } from "sonner";

import { archiveAnnouncement } from "@/lib/action/announcement.action";
import { Button } from "@/components/ui/button";

type ArchiveAnnouncementButtonProps = {
  announcementId: string;
  title: string;
};

export default function ArchiveAnnouncementButton({
  announcementId,
  title,
}: ArchiveAnnouncementButtonProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function archive(): void {
    if (!window.confirm(`Archive "${title}"? Employees will no longer see it.`)) {
      return;
    }

    startTransition(async () => {
      const result = await archiveAnnouncement({ id: announcementId });

      if (!result.success) {
        toast.error("Unable to archive announcement", {
          description: result.error.message,
        });
        return;
      }

      toast.success("Announcement archived.");
      router.refresh();
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={archive} disabled={isPending}>
      <Archive /> {isPending ? "Archiving..." : "Archive"}
    </Button>
  );
}

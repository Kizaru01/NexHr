"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteAnnouncement } from "@/lib/action/announcement.action";
import { Button } from "@/components/ui/button";

type DeleteAnnouncementButtonProps = {
  announcementId: string;
  title: string;
};

export default function DeleteAnnouncementButton({
  announcementId,
  title,
}: DeleteAnnouncementButtonProps): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function remove(): void {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) {
      return;
    }

    startTransition(async () => {
      const result = await deleteAnnouncement({ id: announcementId });

      if (!result.success) {
        toast.error("Unable to delete announcement", {
          description: result.error.message,
        });
        return;
      }

      toast.success("Announcement deleted.");
      router.refresh();
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={remove} disabled={isPending}>
      <Trash2 /> {isPending ? "Deleting..." : "Delete"}
    </Button>
  );
}

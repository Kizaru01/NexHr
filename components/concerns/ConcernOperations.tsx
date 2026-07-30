"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Archive, Check, LockKeyhole, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CONCERN_PRIORITIES,
  CONCERN_STATUSES,
  type ConcernPriority,
  type ConcernStatus,
} from "@/constants/concerns";
import {
  addConcernInternalNote,
  archiveConcern,
  updateConcernPriority,
  updateConcernStatus,
} from "@/lib/action/concern.action";

export default function ConcernOperations({
  concernId,
  currentPriority,
  currentStatus,
  isArchived,
}: {
  concernId: string;
  currentPriority: ConcernPriority;
  currentStatus: ConcernStatus;
  isArchived: boolean;
}): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [status, setStatus] = useState<ConcernStatus>(currentStatus);
  const [priority, setPriority] =
    useState<ConcernPriority>(currentPriority);
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  function saveStatus(): void {
    startTransition(async () => {
      const result = await updateConcernStatus({
        concernId,
        status,
        reason: reason || undefined,
      });

      if (!result.success) {
        toast.error("Status could not be updated", {
          description: result.error.message,
        });
        return;
      }

      setReason("");
      toast.success(`Status changed to ${status}`);
      router.refresh();
    });
  }

  function savePriority(): void {
    startTransition(async () => {
      const result = await updateConcernPriority({ concernId, priority });

      if (!result.success) {
        toast.error("Priority could not be updated", {
          description: result.error.message,
        });
        return;
      }

      toast.success(`Priority changed to ${priority}`);
      router.refresh();
    });
  }

  function addNote(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    startTransition(async () => {
      const result = await addConcernInternalNote({ concernId, note });

      if (!result.success) {
        toast.error("Internal note could not be saved", {
          description: result.error.message,
        });
        return;
      }

      setNote("");
      toast.success("Private note added");
      router.refresh();
    });
  }

  function archive(): void {
    startTransition(async () => {
      const result = await archiveConcern({ concernId });

      if (!result.success) {
        toast.error("Concern could not be archived", {
          description: result.error.message,
        });
        return;
      }

      toast.success("Concern archived");
      router.push("/employee-concerns");
      router.refresh();
    });
  }

  if (isArchived) {
    return (
      <div className="rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
        This concern is archived and is available in read-only mode.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="concern-status">Workflow status</Label>
        <div className="flex gap-2">
          <Select
            value={status}
            disabled={isPending}
            onValueChange={(value) => setStatus(value as ConcernStatus)}
          >
            <SelectTrigger id="concern-status" className="min-w-0 flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONCERN_STATUSES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Save concern status"
            disabled={isPending || status === currentStatus}
            onClick={saveStatus}
          >
            <Check />
          </Button>
        </div>
        {status !== currentStatus ? (
          <Textarea
            value={reason}
            maxLength={500}
            disabled={isPending}
            className="min-h-20"
            aria-label="Reason for status change"
            placeholder="Optional note about this status change"
            onChange={(event) => setReason(event.target.value)}
          />
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="concern-priority">Priority</Label>
        <div className="flex gap-2">
          <Select
            value={priority}
            disabled={isPending}
            onValueChange={(value) => setPriority(value as ConcernPriority)}
          >
            <SelectTrigger id="concern-priority" className="min-w-0 flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONCERN_PRIORITIES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="Save concern priority"
            disabled={isPending || priority === currentPriority}
            onClick={savePriority}
          >
            <Save />
          </Button>
        </div>
      </div>

      <form className="space-y-2 border-t pt-5" onSubmit={addNote}>
        <div className="flex items-center gap-2">
          <LockKeyhole className="size-4 text-primary" />
          <Label htmlFor="internal-note">Internal note</Label>
        </div>
        <Textarea
          id="internal-note"
          value={note}
          minLength={2}
          maxLength={3_000}
          required
          disabled={isPending}
          className="min-h-24"
          placeholder="Visible only to HR and admins"
          onChange={(event) => setNote(event.target.value)}
        />
        <Button
          type="submit"
          variant="secondary"
          size="sm"
          disabled={isPending}
        >
          <LockKeyhole />
          Add private note
        </Button>
      </form>

      <div className="border-t pt-5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={isPending || currentStatus !== "Closed"}
          onClick={archive}
        >
          <Archive />
          Archive concern
        </Button>
        {currentStatus !== "Closed" ? (
          <p className="mt-2 text-xs text-muted-foreground">
            Close the concern before archiving it.
          </p>
        ) : null}
      </div>
    </div>
  );
}

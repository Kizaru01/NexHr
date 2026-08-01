"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Clock3, Pencil, Save, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  deleteEmployeeProfileNote,
  updateEmployeeProfileNote,
} from "@/lib/action/employee-note.action";
import type { EmployeeProfileResult } from "@/types/hr-dashboard";

type Note = EmployeeProfileResult["temporaryNotes"][number];

function formatDateTime(value: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function EmployeeProfileNoteItem({
  note,
}: {
  note: Note;
}): React.JSX.Element {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(note.body);
  const [durationDays, setDurationDays] = useState(note.remainingDays);
  const [isPending, startTransition] = useTransition();

  function cancelEditing(): void {
    setDraft(note.body);
    setDurationDays(note.remainingDays);
    setIsEditing(false);
  }

  function save(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    startTransition(async () => {
      const result = await updateEmployeeProfileNote({
        noteId: note.id,
        note: draft,
        durationDays,
      });

      if (!result.success) {
        toast.error("Note could not be updated", {
          description: result.error.message,
        });
        return;
      }

      setIsEditing(false);
      toast.success("Employee note updated");
      router.refresh();
    });
  }

  function remove(): void {
    if (!window.confirm("Delete this employee note? This cannot be undone.")) {
      return;
    }

    startTransition(async () => {
      const result = await deleteEmployeeProfileNote({ noteId: note.id });

      if (!result.success) {
        toast.error("Note could not be deleted", {
          description: result.error.message,
        });
        return;
      }

      toast.success("Employee note deleted");
      router.refresh();
    });
  }

  if (isEditing) {
    return (
      <form
        className="space-y-3 rounded-xl border border-primary/20 bg-primary-soft/30 p-4"
        onSubmit={save}
      >
        <Textarea
          value={draft}
          required
          minLength={2}
          maxLength={3_000}
          disabled={isPending}
          className="min-h-28 bg-card"
          aria-label="Edit note for employee"
          onChange={(event) => setDraft(event.target.value)}
        />
        <div className="space-y-1.5 sm:w-40">
          <label
            htmlFor={`employee-note-duration-${note.id}`}
            className="text-xs font-medium text-muted-foreground"
          >
            Display for (days)
          </label>
          <Input
            id={`employee-note-duration-${note.id}`}
            type="number"
            min={1}
            max={365}
            required
            value={durationDays}
            disabled={isPending}
            onChange={(event) => setDurationDays(Number(event.target.value))}
          />
        </div>
        <div className="grid grid-cols-2 gap-2 sm:flex">
          <Button type="submit" size="sm" disabled={isPending}>
            <Save /> {isPending ? "Saving…" : "Save changes"}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={isPending}
            onClick={cancelEditing}
          >
            <X /> Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <article className="rounded-xl border border-warning/15 bg-warning-soft p-4">
      <p className="text-sm leading-6 whitespace-pre-wrap">{note.body}</p>
      <p className="mt-3 text-xs text-muted-foreground">
        {note.author} · {formatDateTime(note.createdAt)}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-warning-foreground">
        <Clock3 className="size-3.5" />
        Employee can view until {formatDateTime(note.expiresAt)}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={() => setIsEditing(true)}
        >
          <Pencil /> Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          size="sm"
          disabled={isPending}
          onClick={remove}
        >
          <Trash2 /> {isPending ? "Deleting…" : "Delete"}
        </Button>
      </div>
    </article>
  );
}

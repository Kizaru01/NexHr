import { LockKeyhole } from "lucide-react";

import ConcernNoteComposer from "@/components/concerns/ConcernNoteComposer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConcernNoteView } from "@/types/concerns";

function formatDateTime(value: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatExpiration(value: string | null): string {
  if (!value) return "No expiration set";

  return `Visible until ${new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))}`;
}

export default function ConcernInternalNotes({
  concernId,
  notes,
}: {
  concernId: string;
  notes: ConcernNoteView[];
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <LockKeyhole className="size-4 text-primary" />
          Internal notes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {notes.length ? (
          <div className="space-y-3">
            {notes.map((note) => (
              <article
                key={note.id}
                className="rounded-lg border border-warning/15 bg-warning-soft p-3.5"
              >
                <p className="text-sm leading-6 whitespace-pre-wrap">
                  {note.body}
                </p>
                <p className="mt-2 text-[0.6875rem] text-muted-foreground">
                  {note.author} · {formatDateTime(note.createdAt)}
                </p>
                <p className="mt-1 text-[0.6875rem] font-medium text-warning-foreground">
                  {formatExpiration(note.expiresAt)}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            No private notes have been added. Notes here are never visible to
            the employee.
          </p>
        )}
        <ConcernNoteComposer concernId={concernId} />
      </CardContent>
    </Card>
  );
}

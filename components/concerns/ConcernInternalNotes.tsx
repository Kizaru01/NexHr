import { LockKeyhole } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ConcernNoteView } from "@/types/concerns";

function formatDateTime(value: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function ConcernInternalNotes({
  notes,
}: {
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
      <CardContent>
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
              </article>
            ))}
          </div>
        ) : (
          <p className="text-sm leading-6 text-muted-foreground">
            No private notes have been added. Notes here are never visible to
            the employee.
          </p>
        )}
      </CardContent>
    </Card>
  );
}

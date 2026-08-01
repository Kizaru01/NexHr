import { Clock3, MessageSquareText } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmployeeDashboardResult } from "@/types/employee-portal";

type Note = EmployeeDashboardResult["hrNotes"][number];

function formatDateTime(value: string | null): string {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function EmployeeHrNotes({
  notes,
}: {
  notes: Note[];
}): React.JSX.Element | null {
  if (!notes.length) return null;

  return (
    <Card className="border-primary/20 bg-primary-soft/40">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="size-4 text-primary" />
          Notes from HR
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {notes.map((note) => (
          <article key={note.id} className="rounded-xl border bg-card p-4">
            <p className="text-sm leading-6 whitespace-pre-wrap">
              {note.body}
            </p>
            <p className="mt-3 text-xs text-muted-foreground">
              From HR · {formatDateTime(note.createdAt)}
            </p>
            <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-primary">
              <Clock3 className="size-3.5" />
              Available until {formatDateTime(note.expiresAt)}
            </p>
          </article>
        ))}
      </CardContent>
    </Card>
  );
}

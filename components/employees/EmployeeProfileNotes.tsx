import { MessageSquareText } from "lucide-react";

import EmployeeProfileNoteComposer from "@/components/employees/EmployeeProfileNoteComposer";
import EmployeeProfileNoteItem from "@/components/employees/EmployeeProfileNoteItem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { EmployeeProfileResult } from "@/types/hr-dashboard";

type Note = EmployeeProfileResult["temporaryNotes"][number];

export default function EmployeeProfileNotes({
  employeeId,
  notes,
}: {
  employeeId: string;
  notes: Note[];
}): React.JSX.Element {
  return (
    <Card className="lg:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="size-4 text-primary" />
          Notes for employee
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Active notes appear in this employee&apos;s account until they expire.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {notes.length ? (
          <div className="grid gap-3 md:grid-cols-2">
            {notes.map((note) => (
              <EmployeeProfileNoteItem key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No active notes for this employee.
          </p>
        )}

        <EmployeeProfileNoteComposer employeeId={employeeId} />
      </CardContent>
    </Card>
  );
}

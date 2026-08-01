"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addEmployeeProfileNote } from "@/lib/action/employee-note.action";

export default function EmployeeProfileNoteComposer({
  employeeId,
}: {
  employeeId: string;
}): React.JSX.Element {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [durationDays, setDurationDays] = useState(7);
  const [isPending, startTransition] = useTransition();

  function submit(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    startTransition(async () => {
      const result = await addEmployeeProfileNote({
        employeeId,
        note,
        durationDays,
      });

      if (!result.success) {
        toast.error("Note could not be saved", {
          description: result.error.message,
        });
        return;
      }

      setNote("");
      toast.success("Note sent to employee");
      router.refresh();
    });
  }

  return (
    <form className="space-y-3 border-t pt-4" onSubmit={submit}>
      <Textarea
        value={note}
        required
        minLength={2}
        maxLength={3_000}
        disabled={isPending}
        className="min-h-24"
        aria-label="Note for employee"
        placeholder="Write a note this employee will see…"
        onChange={(event) => setNote(event.target.value)}
      />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="space-y-1.5 sm:w-40">
          <label
            htmlFor="employee-profile-note-duration"
            className="text-xs font-medium text-muted-foreground"
          >
            Display for (days)
          </label>
          <Input
            id="employee-profile-note-duration"
            type="number"
            min={1}
            max={365}
            required
            value={durationDays}
            disabled={isPending}
            aria-label="How many days to display this note"
            onChange={(event) => setDurationDays(Number(event.target.value))}
          />
        </div>
        <Button
          type="submit"
          size="sm"
          className="w-full sm:w-auto"
          disabled={isPending}
        >
          <Plus />
          {isPending ? "Saving…" : "Add note"}
        </Button>
      </div>
    </form>
  );
}

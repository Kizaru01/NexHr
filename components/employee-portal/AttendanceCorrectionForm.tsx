"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Send } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { submitAttendanceCorrection } from "@/lib/action/employee-portal.action";
import { attendanceCorrectionSchema } from "@/validations/employee-portal.schema";

type CorrectionValues = z.infer<typeof attendanceCorrectionSchema>;

export default function AttendanceCorrectionForm({
  attendanceId,
  hasPendingCorrection,
}: {
  attendanceId: string;
  hasPendingCorrection: boolean;
}) {
  const router = useRouter();
  const form = useForm<CorrectionValues>({
    resolver: zodResolver(attendanceCorrectionSchema),
    defaultValues: { attendanceId, reason: "" },
  });

  async function onSubmit(values: CorrectionValues) {
    const response = await submitAttendanceCorrection(values);
    if (!response.success) {
      toast.error(response.error?.message ?? "Unable to submit your correction request.");
      return;
    }

    toast.success("Attendance correction request submitted.");
    form.reset({ attendanceId, reason: "" });
    router.refresh();
  }

  if (hasPendingCorrection) {
    return (
      <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-800 dark:text-amber-200">
        A correction request for this attendance record is awaiting review.
      </p>
    );
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <Field data-invalid={Boolean(form.formState.errors.reason)}>
        <FieldLabel htmlFor="correction-reason">Reason for correction</FieldLabel>
        <Textarea
          id="correction-reason"
          placeholder="Explain what needs to be corrected and include the accurate time."
          {...form.register("reason")}
        />
        <FieldError errors={[form.formState.errors.reason]} />
      </Field>
      <Button type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Send />}
        Submit correction request
      </Button>
    </form>
  );
}

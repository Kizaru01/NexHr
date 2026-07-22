"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarPlus, Loader2, Paperclip } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import {
  createOwnLeaveRequest,
  updateOwnPendingLeaveRequest,
} from "@/lib/action/employee/employee-leave.action";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import type {
  LeaveBalance,
  LeaveRecordForForm,
} from "@/types/employee-portal";
import { leaveRequestFormSchema } from "@/validations/employee-portal.schema";

type LeaveFormValues = z.infer<typeof leaveRequestFormSchema>;
type Attachment = {
  name: string;
  mimeType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp";
  size: number;
  data: string;
};
type LeaveRequestSheetProps = {
  balances: readonly LeaveBalance[];
  record?: LeaveRecordForForm;
};

const leaveTypes: LeaveFormValues["leaveType"][] = [
  "Annual",
  "Sick",
  "Emergency",
  "Maternity",
  "Paternity",
  "Without Pay",
];
const supportedFiles = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

function initialValues(record?: LeaveRecordForForm): LeaveFormValues {
  return {
    leaveType: record?.leaveType ?? "Annual",
    startDate: record?.startDate?.slice(0, 10) ?? "",
    endDate: record?.endDate?.slice(0, 10) ?? "",
    reason: record?.reason ?? "",
  };
}

function daysBetween(startDate: string, endDate: string): number | null {
  if (!startDate || !endDate) return null;
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  )
    return null;
  return Math.floor((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

function readAttachment(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        name: file.name,
        mimeType: file.type as Attachment["mimeType"],
        size: file.size,
        data: String(reader.result),
      });
    reader.onerror = () =>
      reject(new Error("The attachment could not be read."));
    reader.readAsDataURL(file);
  });
}

export default function LeaveRequestSheet({
  balances,
  record,
}: LeaveRequestSheetProps): React.JSX.Element {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [attachment, setAttachment] = useState<Attachment>();
  const form = useForm<LeaveFormValues>({
    resolver: zodResolver(leaveRequestFormSchema),
    defaultValues: initialValues(record),
  });
  const startDate = useWatch({ control: form.control, name: "startDate" });
  const endDate = useWatch({ control: form.control, name: "endDate" });
  const selectedLeaveType = useWatch({
    control: form.control,
    name: "leaveType",
  });
  const estimatedDays = daysBetween(startDate, endDate);
  const isEdit = Boolean(record);
  const { errors, isSubmitting } = form.formState;

  async function onAttachmentChange(file?: File): Promise<void> {
    if (!file) return;
    if (
      !supportedFiles.includes(file.type as (typeof supportedFiles)[number]) ||
      file.size > 2_000_000
    ) {
      form.setError("reason", {
        message: "Attachment must be a PDF or image no larger than 2 MB.",
      });
      return;
    }
    try {
      setAttachment(await readAttachment(file));
      form.clearErrors("reason");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to read attachment."
      );
    }
  }

  async function onSubmit(values: LeaveFormValues): Promise<void> {
    const payload = {
      ...values,
      startDate: new Date(`${values.startDate}T00:00:00`),
      endDate: new Date(`${values.endDate}T00:00:00`),
      ...(attachment ? { attachment } : {}),
    };
    const response = record
      ? await updateOwnPendingLeaveRequest({ ...payload, leaveId: record.id })
      : await createOwnLeaveRequest(payload);

    if (!response.success) {
      toast.error(response.error?.message ?? "Unable to save leave request.");
      return;
    }

    toast.success(
      isEdit ? "Leave request updated." : "Leave request submitted."
    );
    setOpen(false);
    form.reset(initialValues(record));
    setAttachment(undefined);
    router.refresh();
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {record ? (
          <Button variant="ghost" size="sm">
            Edit
          </Button>
        ) : (
          <Button>
            <CalendarPlus /> Request leave
          </Button>
        )}
      </SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>
            {isEdit ? "Edit pending request" : "Request time away"}
          </SheetTitle>
          <SheetDescription>
            Leave balances are checked again before your request is saved.
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 p-4">
          <div className="grid grid-cols-2 gap-3 rounded-lg bg-muted/60 p-3 text-sm">
            {balances
              .filter((item) => ["Annual", "Sick"].includes(item.leaveType))
              .map((balance) => (
                <div key={balance.leaveType}>
                  <p className="text-muted-foreground">
                    {balance.leaveType} available
                  </p>
                  <p className="font-semibold">
                    {balance.available ?? "Untracked"}
                    {balance.available === null ? "" : " days"}
                  </p>
                </div>
              ))}
          </div>
          <Field data-invalid={Boolean(errors.leaveType)}>
            <FieldLabel>Leave type</FieldLabel>
            <Select
              value={selectedLeaveType}
              onValueChange={(value) =>
                form.setValue(
                  "leaveType",
                  value as LeaveFormValues["leaveType"],
                  { shouldDirty: true }
                )
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {leaveTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FieldError errors={[errors.leaveType]} />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.startDate)}>
              <FieldLabel htmlFor="leave-start">Start date</FieldLabel>
              <Input
                id="leave-start"
                type="date"
                min={new Date().toISOString().slice(0, 10)}
                {...form.register("startDate")}
              />
              <FieldError errors={[errors.startDate]} />
            </Field>
            <Field data-invalid={Boolean(errors.endDate)}>
              <FieldLabel htmlFor="leave-end">End date</FieldLabel>
              <Input
                id="leave-end"
                type="date"
                min={startDate || new Date().toISOString().slice(0, 10)}
                {...form.register("endDate")}
              />
              <FieldError errors={[errors.endDate]} />
            </Field>
          </div>
          <p className="rounded-lg border p-3 text-sm">
            <span className="font-medium">Estimated duration: </span>
            {estimatedDays
              ? `${estimatedDays} day${estimatedDays === 1 ? "" : "s"}`
              : "Select valid dates"}
          </p>
          <Field data-invalid={Boolean(errors.reason)}>
            <FieldLabel htmlFor="leave-reason">Reason</FieldLabel>
            <Textarea
              id="leave-reason"
              placeholder="Share enough context for your approver."
              {...form.register("reason")}
            />
            <FieldError errors={[errors.reason]} />
          </Field>
          <Field>
            <FieldLabel htmlFor="leave-attachment">
              Attachment (optional)
            </FieldLabel>
            <Input
              id="leave-attachment"
              type="file"
              accept="application/pdf,image/jpeg,image/png,image/webp"
              onChange={(event) => onAttachmentChange(event.target.files?.[0])}
            />
            <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
              <Paperclip className="size-3" />{" "}
              {attachment?.name ?? "PDF or image up to 2 MB."}
            </p>
          </Field>
          <Button
            className="w-full"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : null}
            {isEdit ? "Save changes" : "Submit request"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}

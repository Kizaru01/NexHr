"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { generatePayroll } from "@/lib/action/payroll.action";
import {
  generatePayrollSchema,
  type GeneratePayrollInput,
} from "@/validations/payroll.schema";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";

type PayrollFormValues = z.input<typeof generatePayrollSchema>;

type GeneratePayrollSheetProps = {
  employees: Array<{ id: string; label: string }>;
};

function defaultValues(): PayrollFormValues {
  const today = new Date();

  return {
    employeeId: "",
    month: today.getMonth() + 1,
    year: today.getFullYear(),
    overtimePay: 0,
    bonus: 0,
    deductions: 0,
    tax: 0,
    remarks: "",
  };
}

export default function GeneratePayrollSheet({
  employees,
}: GeneratePayrollSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<PayrollFormValues, undefined, GeneratePayrollInput>({
    resolver: zodResolver(generatePayrollSchema),
    defaultValues: defaultValues(),
  });

  function handleOpenChange(open: boolean): void {
    if (!isPending) {
      setIsOpen(open);
      if (!open) form.reset(defaultValues());
    }
  }

  function submit(values: GeneratePayrollInput): void {
    startTransition(async () => {
      const result = await generatePayroll(values);

      if (!result.success) {
        toast.error(result.error?.message ?? "Unable to generate payroll.");
        return;
      }

      toast.success("Payroll generated successfully.");
      handleOpenChange(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button onClick={() => setIsOpen(true)} disabled={!employees.length}>
        <Plus /> Generate payroll
      </Button>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Generate payroll</SheetTitle>
            <SheetDescription>
              Basic salary and allowance are taken from the active employee record.
            </SheetDescription>
          </SheetHeader>
          <form onSubmit={form.handleSubmit(submit)} className="flex flex-1 flex-col gap-5 p-4">
            <Field data-invalid={Boolean(form.formState.errors.employeeId)}>
              <FieldLabel>Employee</FieldLabel>
              <Select value={form.watch("employeeId")} onValueChange={(value) => form.setValue("employeeId", value, { shouldValidate: true })}>
                <SelectTrigger aria-invalid={Boolean(form.formState.errors.employeeId)}>
                  <SelectValue placeholder="Select an active employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => <SelectItem key={employee.id} value={employee.id}>{employee.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <FieldError errors={[form.formState.errors.employeeId]} />
            </Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField form={form} name="month" label="Pay month" min={1} max={12} />
              <NumberField form={form} name="year" label="Pay year" min={2000} max={2100} />
              <NumberField form={form} name="overtimePay" label="Overtime pay" min={0} step="0.01" />
              <NumberField form={form} name="bonus" label="Bonus" min={0} step="0.01" />
              <NumberField form={form} name="deductions" label="Deductions" min={0} step="0.01" />
              <NumberField form={form} name="tax" label="Tax" min={0} step="0.01" />
            </div>

            <Field data-invalid={Boolean(form.formState.errors.remarks)}>
              <FieldLabel htmlFor="payroll-remarks">Remarks (optional)</FieldLabel>
              <Textarea id="payroll-remarks" placeholder="Add a payroll note" {...form.register("remarks")} />
              <FieldDescription>Review the amounts before generating; a pay period can only be generated once per employee.</FieldDescription>
              <FieldError errors={[form.formState.errors.remarks]} />
            </Field>

            <SheetFooter className="mt-auto px-0">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isPending}>Cancel</Button>
              <Button type="submit" disabled={isPending}>{isPending ? "Generating..." : "Generate payroll"}</Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

function NumberField({ form, name, label, min, max, step }: { form: ReturnType<typeof useForm<PayrollFormValues, undefined, GeneratePayrollInput>>; name: "month" | "year" | "overtimePay" | "bonus" | "deductions" | "tax"; label: string; min: number; max?: number; step?: string; }) {
  const error = form.formState.errors[name];

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={`payroll-${name}`}>{label}</FieldLabel>
      <Input id={`payroll-${name}`} type="number" min={min} max={max} step={step} aria-invalid={Boolean(error)} {...form.register(name, { valueAsNumber: true })} />
      <FieldError errors={[error]} />
    </Field>
  );
}

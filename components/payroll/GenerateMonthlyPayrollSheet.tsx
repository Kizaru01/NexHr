"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { generateMonthlyPayroll } from "@/lib/action/payroll.action";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type {
  MonthlyPayrollFormValues,
  MonthlyPayrollNumberFieldProps,
} from "@/types/payroll";
import type { GenerateMonthlyPayrollInput } from "@/validations/payroll.schema";
import { payrollPeriodSchema } from "@/validations/payroll.schema";

function defaultValues(): MonthlyPayrollFormValues {
  const today = new Date();

  return { month: today.getMonth() + 1, year: today.getFullYear() };
}

export default function GenerateMonthlyPayrollSheet(): React.JSX.Element {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<
    MonthlyPayrollFormValues,
    undefined,
    GenerateMonthlyPayrollInput
  >({
    resolver: zodResolver(payrollPeriodSchema),
    defaultValues: defaultValues(),
  });

  function handleOpenChange(open: boolean): void {
    if (!isPending) {
      setIsOpen(open);
      if (!open) form.reset(defaultValues());
    }
  }

  function submit(values: GenerateMonthlyPayrollInput): void {
    startTransition(async () => {
      const result = await generateMonthlyPayroll(values);

      if (!result.success) {
        toast.error(
          result.error?.message ?? "Unable to generate monthly payroll."
        );
        return;
      }

      toast.success(
        `Generated ${result.data?.created ?? 0} payrolls; skipped ${result.data?.skipped ?? 0} existing records.`
      );
      handleOpenChange(false);
      router.refresh();
    });
  }

  return (
    <>
      <Button variant="outline" onClick={() => setIsOpen(true)}>
        <CalendarDays /> Generate monthly payroll
      </Button>
      <Sheet open={isOpen} onOpenChange={handleOpenChange}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Generate monthly payroll</SheetTitle>
            <SheetDescription>
              This creates base salary and allowance payrolls for all active
              employees.
            </SheetDescription>
          </SheetHeader>
          <form
            onSubmit={form.handleSubmit(submit)}
            className="flex flex-1 flex-col gap-5 p-4"
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <NumberField
                form={form}
                name="month"
                label="Pay month"
                min={1}
                max={12}
              />
              <NumberField
                form={form}
                name="year"
                label="Pay year"
                min={2000}
                max={2100}
              />
            </div>
            <FieldDescription>
              Existing payroll records for the selected period stay unchanged.
              Use individual generation instead when a new payroll needs
              overtime, bonuses, deductions, or tax.
            </FieldDescription>
            <SheetFooter className="mt-auto px-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? "Generating..." : "Generate monthly payroll"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}

function NumberField({
  form,
  name,
  label,
  min,
  max,
}: MonthlyPayrollNumberFieldProps): React.JSX.Element {
  const error = form.formState.errors[name];

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={`monthly-payroll-${name}`}>{label}</FieldLabel>
      <Input
        id={`monthly-payroll-${name}`}
        type="number"
        min={min}
        max={max}
        aria-invalid={Boolean(error)}
        {...form.register(name, { valueAsNumber: true })}
      />
      <FieldError errors={[error]} />
    </Field>
  );
}

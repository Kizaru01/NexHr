"use client";

import { useFormContext } from "react-hook-form";
import {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EmployeeFormValues } from "../Forms/EmployeeForm";

export function SalaryInformation(): React.JSX.Element {
  const {
    register,
    formState: { errors },
  } = useFormContext<EmployeeFormValues>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Salary Information</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field data-invalid={!!errors.salary?.basic}>
          <FieldLabel>Basic Salary</FieldLabel>
          <Input
            type="number"
            min={0}
            step="0"
            placeholder="0.00"
            {...register("salary.basic", { valueAsNumber: true })}
          />
          <FieldError errors={[errors.salary?.basic]} />
        </Field>

        <Field data-invalid={!!errors.salary?.allowance}>
          <FieldLabel>Allowance</FieldLabel>
          <Input
            type="number"
            min={0}
            step="0"
            placeholder="0.00"
            {...register("salary.allowance", { valueAsNumber: true })}
          />
          <FieldDescription>Optional monthly allowance.</FieldDescription>
          <FieldError errors={[errors.salary?.allowance]} />
        </Field>
      </div>
    </div>
  );
}

"use client";

import { useFormContext } from "react-hook-form";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { EmployeeFormValues } from "../Forms/EmployeeForm";

export function EmergencyContact(): React.JSX.Element {
  const {
    register,
    formState: { errors },
  } = useFormContext<EmployeeFormValues>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Emergency Contact</h3>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field data-invalid={!!errors.emergencyContact?.name}>
          <FieldLabel>Contact Name</FieldLabel>
          <Input
            placeholder="Maria Dela Cruz"
            {...register("emergencyContact.name")}
          />
          <FieldError errors={[errors.emergencyContact?.name]} />
        </Field>

        <Field data-invalid={!!errors.emergencyContact?.relationship}>
          <FieldLabel>Relationship</FieldLabel>
          <Input
            placeholder="Spouse"
            {...register("emergencyContact.relationship")}
          />
          <FieldError errors={[errors.emergencyContact?.relationship]} />
        </Field>

        <Field data-invalid={!!errors.emergencyContact?.phone}>
          <FieldLabel>Phone</FieldLabel>
          <Input
            placeholder="09XX XXX XXXX"
            {...register("emergencyContact.phone")}
          />
          <FieldError errors={[errors.emergencyContact?.phone]} />
        </Field>
      </div>
    </div>
  );
}

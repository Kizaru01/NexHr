"use client";

import { useFormContext } from "react-hook-form";

import { Field, FieldLabel, FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

import z from "zod";
import { EmployeeFormValues } from "../Forms/EmployeeForm";

export function AddressInformation() {
  const {
    register,
    formState: { errors },
  } = useFormContext<EmployeeFormValues>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Address Information</h3>

      <Field data-invalid={!!errors.address?.street}>
        <FieldLabel>Street</FieldLabel>
        <Input placeholder="123 Mabini St." {...register("address.street")} />
        <FieldError errors={[errors.address?.street]} />
      </Field>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field data-invalid={!!errors.address?.barangay}>
          <FieldLabel>Barangay</FieldLabel>
          <Input
            placeholder="Barangay San Isidro"
            {...register("address.barangay")}
          />
          <FieldError errors={[errors.address?.barangay]} />
        </Field>

        <Field data-invalid={!!errors.address?.city}>
          <FieldLabel>City</FieldLabel>
          <Input placeholder="San Fernando" {...register("address.city")} />
          <FieldError errors={[errors.address?.city]} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field data-invalid={!!errors.address?.province}>
          <FieldLabel>Province</FieldLabel>
          <Input placeholder="Pampanga" {...register("address.province")} />
          <FieldError errors={[errors.address?.province]} />
        </Field>

        <Field data-invalid={!!errors.address?.postalCode}>
          <FieldLabel>Postal Code</FieldLabel>
          <Input placeholder="2000" {...register("address.postalCode")} />
          <FieldError errors={[errors.address?.postalCode]} />
        </Field>
      </div>
    </div>
  );
}

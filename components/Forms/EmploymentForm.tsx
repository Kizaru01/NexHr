"use client";

import { Controller, useFormContext, useWatch } from "react-hook-form";
import { useMemo } from "react";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import type {
  EmployeePositionSelectOption,
  EmployeeSelectOption,
} from "@/types/global";
import type { EmployeeFormInput } from "../Forms/EmployeeForm";
import { EMPLOYMENT_TYPES, formatDate } from "@/lib/utils";

type EmploymentInformationProps = {
  departmentOptions: EmployeeSelectOption[];
  positionOptions: EmployeePositionSelectOption[];
};

export const EmploymentInformation = ({
  departmentOptions,
  positionOptions,
}: EmploymentInformationProps): React.JSX.Element => {
  const { control, getValues, setValue } = useFormContext<EmployeeFormInput>();
  const selectedDepartment = useWatch({ control, name: "department" });
  const filteredPositionOptions = useMemo(
    () =>
      positionOptions.filter(
        (position) => position.departmentId === selectedDepartment
      ),
    [positionOptions, selectedDepartment]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Employment Information</h3>
      <div className="grid grid-cols-2 gap-4">
        <Controller
          name="hireDate"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="hireDate">Hire Date</FieldLabel>
              <Input
                {...field}
                id="hireDate"
                type="date"
                aria-invalid={fieldState.invalid}
                value={
                  typeof field.value === "string"
                    ? field.value
                    : formatDate(field.value)
                }
                onChange={(event) => field.onChange(event.target.value)}
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="department"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="department">Department</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={(departmentId) => {
                  field.onChange(departmentId);

                  const selectedPosition = getValues("position");
                  const currentPosition = positionOptions.find(
                    (position) => position.value === selectedPosition
                  );

                  if (
                    currentPosition &&
                    currentPosition.departmentId !== departmentId
                  ) {
                    setValue("position", "", {
                      shouldDirty: true,
                      shouldValidate: true,
                    });
                  }
                }}
                disabled={departmentOptions.length === 0}
              >
                <SelectTrigger
                  id="department"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentOptions.length === 0 ? (
                    <p className="px-2 py-1.5 text-sm text-muted-foreground">
                      No departments available
                    </p>
                  ) : (
                    departmentOptions.map((department) => (
                      <SelectItem
                        key={department.value}
                        value={department.value}
                      >
                        {department.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="position"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="position">Position</FieldLabel>
              <Select
                name={field.name}
                value={field.value ?? ""}
                onValueChange={field.onChange}
                disabled={
                  !selectedDepartment || filteredPositionOptions.length === 0
                }
              >
                <SelectTrigger id="position" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  {!selectedDepartment ? (
                    <p className="px-2 py-1.5 text-sm text-muted-foreground">
                      Select a department first
                    </p>
                  ) : filteredPositionOptions.length === 0 ? (
                    <p className="px-2 py-1.5 text-sm text-muted-foreground">
                      No positions available for this department
                    </p>
                  ) : (
                    filteredPositionOptions.map((position) => (
                      <SelectItem key={position.value} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />

        <Controller
          name="employmentType"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="employmentType">Employment Type</FieldLabel>
              <Select
                name={field.name}
                value={field.value ?? ""}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="employmentType"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </div>
  );
};

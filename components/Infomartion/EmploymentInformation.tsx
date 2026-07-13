"use client";

import { Controller, useFormContext } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import ControllerForm from "../Forms/ControllerForm";
import {
  departmentOptions,
  EMPLOYMENT_STATUS,
  EMPLOYMENT_TYPES,
  managerOptions,
  positionOptions,
} from "@/utils";
import { EmployeeFormValues } from "../Forms/EmployeeForm";

export function EmploymentInformation() {
  const { control } = useFormContext<EmployeeFormValues>();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Employment Information</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ControllerForm
          name="employeeId"
          formControl={control}
          placeholder="EMP-0001"
          description="Employee must be unique across the company"
          title="Employee Id"
        />
        <ControllerForm
          name="hireDate"
          formControl={control}
          placeholder="EMP-0001"
          title="Hire Date"
          type="date"
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          name="department"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="department">Department</FieldLabel>
              {departmentOptions.length > 0 ? (
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="department"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departmentOptions.map((department) => (
                      <SelectItem
                        key={department.label}
                        value={department.value}
                      >
                        {department.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  {...field}
                  id="department"
                  aria-invalid={fieldState.invalid}
                  placeholder="Department ID"
                />
              )}
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
              {positionOptions.length > 0 ? (
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="position"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select position" />
                  </SelectTrigger>
                  <SelectContent>
                    {positionOptions.map((position) => (
                      <SelectItem key={position.label} value={position.value}>
                        {position.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  {...field}
                  id="position"
                  aria-invalid={fieldState.invalid}
                  placeholder="Position ID"
                />
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          name="employmentType"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="employmentType">Employment Type</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
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
        <Controller
          name="employmentStatus"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="employmentType">Employment Type</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger
                  id="employmentType"
                  aria-invalid={fieldState.invalid}
                >
                  <SelectValue placeholder="Select employment type" />
                </SelectTrigger>
                <SelectContent>
                  {EMPLOYMENT_STATUS.map((type) => (
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

        <Controller
          name="manager"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="manager">Manager</FieldLabel>
              {managerOptions.length > 0 ? (
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger id="manager" aria-invalid={fieldState.invalid}>
                    <SelectValue placeholder="Select manager" />
                  </SelectTrigger>
                  <SelectContent>
                    {managerOptions.map((manager) => (
                      <SelectItem key={manager.label} value={manager.value}>
                        {manager.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  {...field}
                  id="manager"
                  aria-invalid={fieldState.invalid}
                  placeholder="Manager ID (optional)"
                />
              )}
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>

      <ControllerForm
        name="notes"
        formControl={control}
        placeholder="Any additional notes about this employee..."
        row={3}
        title="notes"
      />
    </div>
  );
}

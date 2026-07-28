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

import { formatDate } from "@/lib/utils";
import type { EmployeeFormInput } from "../Forms/EmployeeForm";

export function PersonalInformation(): React.JSX.Element {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<EmployeeFormInput>();
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Personal Information</h3>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Field data-invalid={!!errors.firstName}>
          <FieldLabel htmlFor="firstName">First Name</FieldLabel>
          <Input
            id="firstName"
            placeholder="Charles"
            {...register("firstName")}
          />
          <FieldError errors={[errors.firstName]} />
        </Field>
        <Field data-invalid={!!errors.middleName}>
          <FieldLabel htmlFor="middleName">Middle Name</FieldLabel>
          <Input
            id="middleName"
            placeholder="Manansala"
            {...register("middleName")}
          />
          <FieldError errors={[errors.middleName]} />
        </Field>{" "}
        <Field data-invalid={!!errors.lastName}>
          <FieldLabel htmlFor="lastName">Last Name</FieldLabel>
          <Input
            id="lastName"
            placeholder="Evangelsita"
            {...register("lastName")}
          />
          <FieldError errors={[errors.lastName]} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <Input
            id="email"
            placeholder="charlesevangelista@gmail.com"
            {...register("email")}
          />
          <FieldError errors={[errors.email]} />
        </Field>
        <Field data-invalid={!!errors.phone}>
          <FieldLabel htmlFor="phone">Phone</FieldLabel>
          <Input id="phone" placeholder="09123456789" {...register("phone")} />
          <FieldError errors={[errors.phone]} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-1">
        <Field data-invalid={!!errors.avatar}>
          <FieldLabel htmlFor="avatar">Avatar</FieldLabel>
          <Input
            id="avatar"
            type="url"
            placeholder="https://example.com/avatar.jpg"
            {...register("avatar")}
          />
          <FieldError errors={[errors.avatar]} />
        </Field>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Controller
          name="birthDate"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="birthDate">Birth Date</FieldLabel>
              <Input
                id="birthDate"
                type="date"
                aria-invalid={fieldState.invalid}
                name={field.name}
                onBlur={field.onBlur}
                onChange={(event) => field.onChange(event.target.value)}
                ref={field.ref}
                value={
                  typeof field.value === "string"
                    ? field.value
                    : formatDate(field.value)
                }
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
        <Controller
          name="gender"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="gender">Gender</FieldLabel>
              <Select
                name={field.name}
                value={field.value}
                onValueChange={field.onChange}
              >
                <SelectTrigger id="gender" aria-invalid={fieldState.invalid}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </div>
    </div>
  );
}

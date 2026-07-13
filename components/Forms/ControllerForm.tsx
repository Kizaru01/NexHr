"use client";

import {
  Controller,
  type Control,
  type FieldPath,
  type FieldValues,
} from "react-hook-form";
import { Field, FieldLabel, FieldDescription, FieldError } from "../ui/field";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";
import { formatDate } from "@/utils";

type ControllerFormProps<TFieldValues extends FieldValues> = {
  row?: number;
  formControl: Control<TFieldValues>;
  name: FieldPath<TFieldValues>;
  title: string;
  placeholder?: string;
  description?: string;
  type?: string;
};

const ControllerForm = <TFieldValues extends FieldValues>({
  formControl,
  name,
  title,
  placeholder,
  description,
  row,
  type,
}: ControllerFormProps<TFieldValues>) => {
  return (
    <Controller
      name={name}
      control={formControl}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor={name}>{title}</FieldLabel>
          {name === "notes" ? (
            <Textarea
              {...field}
              id={name}
              aria-invalid={fieldState.invalid}
              placeholder={placeholder}
              rows={row}
            />
          ) : (
            <Input
              {...field}
              id={name}
              aria-invalid={fieldState.invalid}
              placeholder={placeholder}
              type={type}
              value={type === "date" ? formatDate(field.value) : field.value}
              onChange={
                type === "date"
                  ? (e) => field.onChange(e.target.value)
                  : field.onChange
              }
            />
          )}
          <FieldDescription>{description}</FieldDescription>
          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
        </Field>
      )}
    />
  );
};

export default ControllerForm;

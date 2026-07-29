"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import z from "zod";

import { Button } from "../ui/button";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Textarea } from "../ui/textarea";
import type { DepartmentOption, PositionListItem } from "@/types/management";
import {
  createPositionSchema,
  type CreatePositionInput,
} from "@/validations/position.schema";

type PositionFormInput = z.input<typeof createPositionSchema>;

type PositionFormSheetProps = {
  departments: DepartmentOption[];
  isOpen: boolean;
  isPending: boolean;
  onOpenChange(open: boolean): void;
  onSubmit(values: CreatePositionInput): void;
  position: PositionListItem | null;
};

const emptyValues: PositionFormInput = {
  name: "",
  department: "",
  description: "",
  salary: {
    basic: 0,
    allowance: 0,
  },
};

export default function PositionFormSheet({
  departments,
  isOpen,
  isPending,
  onOpenChange,
  onSubmit,
  position,
}: PositionFormSheetProps): React.JSX.Element {
  const form = useForm<PositionFormInput, undefined, CreatePositionInput>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: position
      ? {
          name: position.name,
          department: position.departmentId,
          description: position.description ?? "",
          salary: {
            basic: position.salary.basic,
            allowance: position.salary.allowance ?? 0,
          },
        }
      : emptyValues,
  });
  const availableDepartments = departments.filter(
    (department) =>
      department.isActive || department.id === position?.departmentId
  );
  const { errors } = form.formState;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{position ? "Edit position" : "Create position"}</SheetTitle>
          <SheetDescription>
            Position names must be unique within their department.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-5 p-4"
        >
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="position-name">Name</FieldLabel>
            <Input
              id="position-name"
              autoFocus
              placeholder="Software Engineer"
              aria-invalid={Boolean(errors.name)}
              {...form.register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Controller
            name="department"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="position-department">Department</FieldLabel>
                <Select
                  name={field.name}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    id="position-department"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDepartments.map((department) => (
                      <SelectItem
                        key={department.id}
                        value={department.id}
                        disabled={
                          !department.isActive &&
                          department.id !== position?.departmentId
                        }
                      >
                        {department.name}
                        {!department.isActive ? " (archived)" : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />

          <Field data-invalid={Boolean(errors.description)}>
            <FieldLabel htmlFor="position-description">
              Description (optional)
            </FieldLabel>
            <Textarea
              id="position-description"
              placeholder="Responsibilities and expectations for this position"
              aria-invalid={Boolean(errors.description)}
              {...form.register("description")}
            />
            <FieldError errors={[errors.description]} />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field data-invalid={Boolean(errors.salary?.basic)}>
              <FieldLabel htmlFor="position-basic-salary">
                Basic salary
              </FieldLabel>
              <Input
                id="position-basic-salary"
                type="number"
                min={0}
                step="0.01"
                aria-invalid={Boolean(errors.salary?.basic)}
                {...form.register("salary.basic", { valueAsNumber: true })}
              />
              <FieldError errors={[errors.salary?.basic]} />
            </Field>
            <Field data-invalid={Boolean(errors.salary?.allowance)}>
              <FieldLabel htmlFor="position-allowance">
                Allowance (optional)
              </FieldLabel>
              <Input
                id="position-allowance"
                type="number"
                min={0}
                step="0.01"
                aria-invalid={Boolean(errors.salary?.allowance)}
                {...form.register("salary.allowance", {
                  valueAsNumber: true,
                })}
              />
              <FieldError errors={[errors.salary?.allowance]} />
            </Field>
          </div>

          <SheetFooter className="mt-auto px-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save position"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

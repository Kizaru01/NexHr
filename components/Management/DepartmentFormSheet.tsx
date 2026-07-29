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
import type {
  DepartmentListItem,
  DepartmentManagerOption,
} from "@/types/management";
import {
  createDepartmentSchema,
  type CreateDepartmentInput,
} from "@/validations/department.schema";

type DepartmentFormInput = z.input<typeof createDepartmentSchema>;

type DepartmentFormSheetProps = {
  department: DepartmentListItem | null;
  managerOptions: DepartmentManagerOption[];
  isOpen: boolean;
  isPending: boolean;
  onOpenChange(open: boolean): void;
  onSubmit(values: CreateDepartmentInput): void;
};

const emptyValues: DepartmentFormInput = {
  name: "",
  code: "",
  description: "",
  manager: "",
};

export default function DepartmentFormSheet({
  department,
  managerOptions,
  isOpen,
  isPending,
  onOpenChange,
  onSubmit,
}: DepartmentFormSheetProps): React.JSX.Element {
  const form = useForm<DepartmentFormInput, undefined, CreateDepartmentInput>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: department
      ? {
          name: department.name,
          code: department.code ?? "",
          description: department.description ?? "",
          manager: department.managerId ?? "",
        }
      : emptyValues,
  });
  const { errors } = form.formState;
  const availableManagers = department
    ? managerOptions.filter(
        (manager) => manager.departmentId === department.id
      )
    : [];

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>
            {department ? "Edit department" : "Create department"}
          </SheetTitle>
          <SheetDescription>
            Department names and optional codes must be unique.
          </SheetDescription>
        </SheetHeader>

        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex flex-1 flex-col gap-5 p-4"
        >
          <Field data-invalid={Boolean(errors.name)}>
            <FieldLabel htmlFor="department-name">Name</FieldLabel>
            <Input
              id="department-name"
              autoFocus
              placeholder="Human Resources"
              aria-invalid={Boolean(errors.name)}
              {...form.register("name")}
            />
            <FieldError errors={[errors.name]} />
          </Field>

          <Field data-invalid={Boolean(errors.code)}>
            <FieldLabel htmlFor="department-code">Code (optional)</FieldLabel>
            <Input
              id="department-code"
              placeholder="HR"
              aria-invalid={Boolean(errors.code)}
              {...form.register("code")}
            />
            <FieldError errors={[errors.code]} />
          </Field>

          <Field data-invalid={Boolean(errors.description)}>
            <FieldLabel htmlFor="department-description">
              Description (optional)
            </FieldLabel>
            <Textarea
              id="department-description"
              placeholder="What this department is responsible for"
              aria-invalid={Boolean(errors.description)}
              {...form.register("description")}
            />
            <FieldError errors={[errors.description]} />
          </Field>

          <Controller
            name="manager"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="department-manager">
                  Manager (optional)
                </FieldLabel>
                <Select
                  name={field.name}
                  value={field.value ?? ""}
                  onValueChange={(value) =>
                    field.onChange(value === "unassigned" ? "" : value)
                  }
                  disabled={!department}
                >
                  <SelectTrigger
                    id="department-manager"
                    aria-invalid={fieldState.invalid}
                  >
                    <SelectValue
                      placeholder={
                        department
                          ? "Select a department manager"
                          : "Create the department before assigning a manager"
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">No manager</SelectItem>
                    {availableManagers.map((manager) => (
                      <SelectItem key={manager.id} value={manager.id}>
                        {manager.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

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
              {isPending ? "Saving..." : "Save department"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}

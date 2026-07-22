"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";

import { Button } from "../ui/button";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";
import { Textarea } from "../ui/textarea";
import type { DepartmentListItem } from "@/types/management";
import {
  createDepartmentSchema,
  type CreateDepartmentInput,
} from "@/validations/department.schema";

type DepartmentFormInput = z.input<typeof createDepartmentSchema>;

type DepartmentFormSheetProps = {
  department: DepartmentListItem | null;
  isOpen: boolean;
  isPending: boolean;
  onOpenChange(open: boolean): void;
  onSubmit(values: CreateDepartmentInput): void;
};

const emptyValues: DepartmentFormInput = {
  name: "",
  code: "",
  description: "",
};

export default function DepartmentFormSheet({
  department,
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
        }
      : emptyValues,
  });
  const { errors } = form.formState;

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

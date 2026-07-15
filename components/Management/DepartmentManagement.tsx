"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Archive, Pencil, Plus, RotateCcw, Search, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import {
  createDepartment,
  deleteDepartment,
  setDepartmentStatus,
  updateDepartment,
} from "@/lib/action/department.action";
import type { DepartmentListItem } from "@/types/management";
import { createDepartmentSchema } from "@/validations/department.schema";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
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

type DepartmentFormInput = z.input<typeof createDepartmentSchema>;
type DepartmentFormValues = z.output<typeof createDepartmentSchema>;

type DepartmentManagementProps = {
  initialDepartments: DepartmentListItem[];
};

const EMPTY_VALUES: DepartmentFormInput = {
  name: "",
  code: "",
  description: "",
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

const DepartmentManagement = ({
  initialDepartments,
}: DepartmentManagementProps) => {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editingDepartment, setEditingDepartment] =
    useState<DepartmentListItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<DepartmentFormInput, undefined, DepartmentFormValues>({
    resolver: zodResolver(createDepartmentSchema),
    defaultValues: EMPTY_VALUES,
  });

  const visibleDepartments = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return initialDepartments;

    return initialDepartments.filter((department) =>
      [department.name, department.code, department.description]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery))
    );
  }, [initialDepartments, query]);

  function resetForm(department?: DepartmentListItem): void {
    form.reset(
      department
        ? {
            name: department.name,
            code: department.code ?? "",
            description: department.description ?? "",
          }
        : EMPTY_VALUES
    );
  }

  function openCreateSheet(): void {
    setEditingDepartment(null);
    resetForm();
    setIsSheetOpen(true);
  }

  function openEditSheet(department: DepartmentListItem): void {
    setEditingDepartment(department);
    resetForm(department);
    setIsSheetOpen(true);
  }

  function handleSheetOpenChange(open: boolean): void {
    setIsSheetOpen(open);
    if (!open) {
      setEditingDepartment(null);
      resetForm();
    }
  }

  function onSubmit(values: DepartmentFormValues): void {
    startTransition(async () => {
      const result = editingDepartment
        ? await updateDepartment({ id: editingDepartment.id, ...values })
        : await createDepartment(values);

      if (!result.success) {
        toast.error(result.error?.message ?? "Unable to save department.");
        return;
      }

      toast.success(
        editingDepartment
          ? "Department updated successfully."
          : "Department created successfully."
      );
      handleSheetOpenChange(false);
      router.refresh();
    });
  }

  function changeStatus(department: DepartmentListItem): void {
    const isActive = !department.isActive;

    startTransition(async () => {
      const result = await setDepartmentStatus({
        id: department.id,
        isActive,
      });

      if (!result.success) {
        toast.error(result.error?.message ?? "Unable to update department.");
        return;
      }

      toast.success(isActive ? "Department restored." : "Department archived.");
      router.refresh();
    });
  }

  function removeDepartment(department: DepartmentListItem): void {
    if (
      !window.confirm(
        `Delete ${department.name}? This is only possible when it has no positions or employees.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deleteDepartment({ id: department.id });

      if (!result.success) {
        toast.error(result.error?.message ?? "Unable to delete department.");
        return;
      }

      toast.success("Department deleted.");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Departments</h1>
          <p className="text-sm text-muted-foreground">
            Manage the departments available during employee creation.
          </p>
        </div>
        <Button onClick={openCreateSheet} disabled={isPending}>
          <Plus /> Add department
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-8"
          placeholder="Search by name, code, or description"
          aria-label="Search departments"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {visibleDepartments.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              {initialDepartments.length === 0
                ? "No departments yet. Create the first department to make it available to employees."
                : "No departments match your search."}
            </div>
          ) : (
            <div className="divide-y">
              {visibleDepartments.map((department) => (
                <div
                  key={department.id}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{department.name}</h2>
                      <span
                        className={
                          department.isActive
                            ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                            : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        }
                      >
                        {department.isActive ? "Active" : "Archived"}
                      </span>
                      {department.code && (
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-muted-foreground">
                          {department.code}
                        </span>
                      )}
                    </div>
                    {department.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {department.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Updated{" "}
                      {dateFormatter.format(new Date(department.updatedAt))}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditSheet(department)}
                      disabled={isPending}
                    >
                      <Pencil /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => changeStatus(department)}
                      disabled={isPending}
                    >
                      {department.isActive ? <Archive /> : <RotateCcw />}
                      {department.isActive ? "Archive" : "Restore"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removeDepartment(department)}
                      disabled={isPending}
                    >
                      <Trash2 /> Delete
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={isSheetOpen} onOpenChange={handleSheetOpenChange}>
        <SheetContent className="overflow-y-auto sm:max-w-md">
          <SheetHeader>
            <SheetTitle>
              {editingDepartment ? "Edit department" : "Create department"}
            </SheetTitle>
            <SheetDescription>
              Department names and optional codes must be unique.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-5 p-4"
          >
            <Field data-invalid={Boolean(form.formState.errors.name)}>
              <FieldLabel htmlFor="department-name">Name</FieldLabel>
              <Input
                id="department-name"
                autoFocus
                placeholder="Human Resources"
                aria-invalid={Boolean(form.formState.errors.name)}
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Field data-invalid={Boolean(form.formState.errors.code)}>
              <FieldLabel htmlFor="department-code">Code (optional)</FieldLabel>
              <Input
                id="department-code"
                placeholder="HR"
                aria-invalid={Boolean(form.formState.errors.code)}
                {...form.register("code")}
              />
              <FieldError errors={[form.formState.errors.code]} />
            </Field>

            <Field data-invalid={Boolean(form.formState.errors.description)}>
              <FieldLabel htmlFor="department-description">
                Description (optional)
              </FieldLabel>
              <Textarea
                id="department-description"
                placeholder="What this department is responsible for"
                aria-invalid={Boolean(form.formState.errors.description)}
                {...form.register("description")}
              />
              <FieldError errors={[form.formState.errors.description]} />
            </Field>

            <SheetFooter className="mt-auto px-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleSheetOpenChange(false)}
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
    </div>
  );
};

export default DepartmentManagement;

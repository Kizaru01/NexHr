"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Archive,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import {
  createPosition,
  deletePosition,
  setPositionStatus,
  updatePosition,
} from "@/lib/action/position.action";
import type { DepartmentOption, PositionListItem } from "@/types/management";
import { createPositionSchema } from "@/validations/position.schema";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
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

type PositionFormInput = z.input<typeof createPositionSchema>;
type PositionFormValues = z.output<typeof createPositionSchema>;

type PositionManagementProps = {
  departments: DepartmentOption[];
  initialPositions: PositionListItem[];
};

const EMPTY_VALUES: PositionFormInput = {
  name: "",
  department: "",
  description: "",
};

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

export default function PositionManagement({
  departments,
  initialPositions,
}: PositionManagementProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [editingPosition, setEditingPosition] =
    useState<PositionListItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const form = useForm<PositionFormInput, undefined, PositionFormValues>({
    resolver: zodResolver(createPositionSchema),
    defaultValues: EMPTY_VALUES,
  });

  const activeDepartmentCount = departments.filter(
    (department) => department.isActive
  ).length;
  const availableDepartments = departments.filter(
    (department) =>
      department.isActive || department.id === editingPosition?.departmentId
  );
  const visiblePositions = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return initialPositions;

    return initialPositions.filter((position) =>
      [position.name, position.departmentName, position.description]
        .filter(Boolean)
        .some((value) => value!.toLocaleLowerCase().includes(normalizedQuery))
    );
  }, [initialPositions, query]);

  function resetForm(position?: PositionListItem): void {
    form.reset(
      position
        ? {
            name: position.name,
            department: position.departmentId,
            description: position.description ?? "",
          }
        : EMPTY_VALUES
    );
  }

  function openCreateSheet(): void {
    setEditingPosition(null);
    resetForm();
    setIsSheetOpen(true);
  }

  function openEditSheet(position: PositionListItem): void {
    setEditingPosition(position);
    resetForm(position);
    setIsSheetOpen(true);
  }

  function handleSheetOpenChange(open: boolean): void {
    setIsSheetOpen(open);
    if (!open) {
      setEditingPosition(null);
      resetForm();
    }
  }

  function onSubmit(values: PositionFormValues): void {
    startTransition(async () => {
      const result = editingPosition
        ? await updatePosition({ id: editingPosition.id, ...values })
        : await createPosition(values);

      if (!result.success) {
        toast.error(result.error?.message ?? "Unable to save position.");
        return;
      }

      toast.success(
        editingPosition
          ? "Position updated successfully."
          : "Position created successfully."
      );
      handleSheetOpenChange(false);
      router.refresh();
    });
  }

  function changeStatus(position: PositionListItem): void {
    const isActive = !position.isActive;

    startTransition(async () => {
      const result = await setPositionStatus({ id: position.id, isActive });

      if (!result.success) {
        toast.error(result.error?.message ?? "Unable to update position.");
        return;
      }

      toast.success(isActive ? "Position restored." : "Position archived.");
      router.refresh();
    });
  }

  function removePosition(position: PositionListItem): void {
    if (
      !window.confirm(
        `Delete ${position.name}? This is only possible when it is not assigned to an employee.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      const result = await deletePosition({ id: position.id });

      if (!result.success) {
        toast.error(result.error?.message ?? "Unable to delete position.");
        return;
      }

      toast.success("Position deleted.");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Positions</h1>
          <p className="text-sm text-muted-foreground">
            Manage department-specific positions available during employee creation.
          </p>
        </div>
        <Button
          onClick={openCreateSheet}
          disabled={isPending || activeDepartmentCount === 0}
        >
          <Plus /> Add position
        </Button>
      </div>

      {activeDepartmentCount === 0 && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-800 dark:text-amber-300">
          Create or restore an active department before creating a position.
        </p>
      )}

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="pl-8"
          placeholder="Search by position, department, or description"
          aria-label="Search positions"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {visiblePositions.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              {initialPositions.length === 0
                ? "No positions yet. Create a position after adding a department."
                : "No positions match your search."}
            </div>
          ) : (
            <div className="divide-y">
              {visiblePositions.map((position) => (
                <div
                  key={position.id}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{position.name}</h2>
                      <span
                        className={
                          position.isActive
                            ? "rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400"
                            : "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                        }
                      >
                        {position.isActive ? "Active" : "Archived"}
                      </span>
                      {!position.departmentIsActive && (
                        <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-800 dark:text-amber-300">
                          Department archived
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {position.departmentName}
                    </p>
                    {position.description && (
                      <p className="line-clamp-2 text-sm text-muted-foreground">
                        {position.description}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Updated {dateFormatter.format(new Date(position.updatedAt))}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => openEditSheet(position)}
                      disabled={isPending}
                    >
                      <Pencil /> Edit
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => changeStatus(position)}
                      disabled={isPending}
                    >
                      {position.isActive ? <Archive /> : <RotateCcw />}
                      {position.isActive ? "Archive" : "Restore"}
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      onClick={() => removePosition(position)}
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
              {editingPosition ? "Edit position" : "Create position"}
            </SheetTitle>
            <SheetDescription>
              Position names must be unique within their department.
            </SheetDescription>
          </SheetHeader>

          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-1 flex-col gap-5 p-4"
          >
            <Field data-invalid={Boolean(form.formState.errors.name)}>
              <FieldLabel htmlFor="position-name">Name</FieldLabel>
              <Input
                id="position-name"
                autoFocus
                placeholder="Software Engineer"
                aria-invalid={Boolean(form.formState.errors.name)}
                {...form.register("name")}
              />
              <FieldError errors={[form.formState.errors.name]} />
            </Field>

            <Controller
              name="department"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="position-department">
                    Department
                  </FieldLabel>
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
                            department.id !== editingPosition?.departmentId
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

            <Field data-invalid={Boolean(form.formState.errors.description)}>
              <FieldLabel htmlFor="position-description">
                Description (optional)
              </FieldLabel>
              <Textarea
                id="position-description"
                placeholder="Responsibilities and expectations for this position"
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
                {isPending ? "Saving..." : "Save position"}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  );
}

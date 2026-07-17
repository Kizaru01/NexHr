"use client";

import { Archive, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import FilterToolbar from "@/components/hr/filters/FilterToolbar";
import {
  departmentSortOptions,
  managementStatusOptions,
} from "@/constants/filter-options";
import {
  createDepartment,
  deleteDepartment,
  setDepartmentStatus,
  updateDepartment,
} from "@/lib/action/department.action";
import type { FilterControl } from "@/types/filters";
import type { DepartmentListItem } from "@/types/management";
import type { CreateDepartmentInput } from "@/validations/department.schema";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import DepartmentFormSheet from "./DepartmentFormSheet";

type DepartmentManagementProps = {
  initialDepartments: DepartmentListItem[];
};

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

const departmentFilterControls: readonly FilterControl[] = [
  {
    type: "search",
    key: "search",
    placeholder: "Search name, code, or description",
    ariaLabel: "Search departments",
    className: "md:w-80",
  },
  {
    type: "select",
    key: "status",
    label: "Department status",
    emptyLabel: "All statuses",
    options: managementStatusOptions,
  },
  {
    type: "select",
    key: "sort",
    label: "Sort departments",
    emptyLabel: "Default sort",
    options: departmentSortOptions,
  },
];

export default function DepartmentManagement({
  initialDepartments,
}: DepartmentManagementProps) {
  const router = useRouter();
  const [editingDepartment, setEditingDepartment] =
    useState<DepartmentListItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function openCreateSheet(): void {
    setEditingDepartment(null);
    setIsSheetOpen(true);
  }

  function openEditSheet(department: DepartmentListItem): void {
    setEditingDepartment(department);
    setIsSheetOpen(true);
  }

  function handleSheetOpenChange(open: boolean): void {
    setIsSheetOpen(open);
    if (!open) {
      setEditingDepartment(null);
    }
  }

  function saveDepartment(values: CreateDepartmentInput): void {
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
      const result = await setDepartmentStatus({ id: department.id, isActive });

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

      <FilterToolbar controls={departmentFilterControls} />

      <Card>
        <CardContent className="p-0">
          {initialDepartments.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No departments match the current filters.
            </div>
          ) : (
            <div className="divide-y">
              {initialDepartments.map((department) => (
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
                      Updated {dateFormatter.format(new Date(department.updatedAt))}
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

      <DepartmentFormSheet
        key={`${editingDepartment?.id ?? "create"}-${isSheetOpen}`}
        department={editingDepartment}
        isOpen={isSheetOpen}
        isPending={isPending}
        onOpenChange={handleSheetOpenChange}
        onSubmit={saveDepartment}
      />
    </div>
  );
}

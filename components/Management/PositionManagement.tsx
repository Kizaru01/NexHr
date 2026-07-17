"use client";

import { Archive, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { toast } from "sonner";

import FilterToolbar from "@/components/hr/filters/FilterToolbar";
import {
  createPosition,
  deletePosition,
  setPositionStatus,
  updatePosition,
} from "@/lib/action/position.action";
import type { DepartmentOption, PositionListItem } from "@/types/management";
import type { CreatePositionInput } from "@/validations/position.schema";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import PositionFormSheet from "./PositionFormSheet";
import { createPositionFilterControls } from "./position-filter-controls";

type PositionManagementProps = {
  departments: DepartmentOption[];
  initialPositions: PositionListItem[];
};

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default function PositionManagement({
  departments,
  initialPositions,
}: PositionManagementProps) {
  const router = useRouter();
  const [editingPosition, setEditingPosition] =
    useState<PositionListItem | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const positionFilterControls = useMemo(
    () => createPositionFilterControls(departments),
    [departments]
  );
  const activeDepartmentCount = departments.filter(
    (department) => department.isActive
  ).length;

  function openCreateSheet(): void {
    setEditingPosition(null);
    setIsSheetOpen(true);
  }

  function openEditSheet(position: PositionListItem): void {
    setEditingPosition(position);
    setIsSheetOpen(true);
  }

  function handleSheetOpenChange(open: boolean): void {
    setIsSheetOpen(open);
    if (!open) {
      setEditingPosition(null);
    }
  }

  function savePosition(values: CreatePositionInput): void {
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
            Manage department-specific positions available during employee
            creation.
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

      <FilterToolbar controls={positionFilterControls} />

      <Card>
        <CardContent className="p-0">
          {initialPositions.length === 0 ? (
            <div className="px-6 py-12 text-center text-sm text-muted-foreground">
              No positions match the current filters.
            </div>
          ) : (
            <div className="divide-y">
              {initialPositions.map((position) => (
                <div
                  key={position.id}
                  className="flex flex-col gap-4 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{position.name.toUpperCase()}</h2>
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

      <PositionFormSheet
        key={`${editingPosition?.id ?? "create"}-${isSheetOpen}`}
        departments={departments}
        isOpen={isSheetOpen}
        isPending={isPending}
        onOpenChange={handleSheetOpenChange}
        onSubmit={savePosition}
        position={editingPosition}
      />
    </div>
  );
}

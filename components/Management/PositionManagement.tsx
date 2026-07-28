"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { Archive, Pencil, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  createPosition,
  deletePosition,
  setPositionStatus,
  updatePosition,
} from "@/lib/action/position.action";
import FilterToolbar from "@/components/hr/filters/FilterToolbar";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import PositionFormSheet from "./PositionFormSheet";
import type { DepartmentOption, PositionListItem } from "@/types/management";
import type { CreatePositionInput } from "@/validations/position.schema";
import { createPositionFilterControls } from "./position-filter-controls";

type PositionManagementProps = {
  departments: DepartmentOption[];
  initialPositions: PositionListItem[];
};

const dateFormatter = new Intl.DateTimeFormat("en", { dateStyle: "medium" });

export default function PositionManagement({
  departments,
  initialPositions,
}: PositionManagementProps): React.JSX.Element {
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
        toast.error("Unable to save position", {
          description: result.error.message,
        });
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
        toast.error("Unable to update position", {
          description: result.error.message,
        });
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
        toast.error("Unable to delete position", {
          description: result.error.message,
        });
        return;
      }

      toast.success("Position deleted.");
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">Organization structure</p>
          <h1 className="heading-1">Positions</h1>
          <p className="page-description">
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
        <p className="rounded-lg border border-warning/25 bg-warning-soft px-4 py-3 text-sm text-warning-foreground">
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
            <div className="divide-y divide-border">
              {initialPositions.map((position) => (
                <div
                  key={position.id}
                  className="flex flex-col gap-4 px-5 py-4 transition-colors hover:bg-muted/40 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-medium">{position.name.toUpperCase()}</h2>
                      <span
                        className={
                          position.isActive
                            ? "status-badge bg-success-soft text-success-foreground"
                            : "status-badge bg-inactive-soft text-inactive"
                        }
                      >
                        {position.isActive ? "Active" : "Archived"}
                      </span>
                      {!position.departmentIsActive && (
                        <span className="status-badge bg-warning-soft text-warning-foreground">
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

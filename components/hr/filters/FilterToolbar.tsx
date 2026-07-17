"use client";

import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { FilterControl } from "@/types/filters";

import { useUrlFilters } from "@/hooks/use-url-filters";

import UrlFilterSelect from "./UrlFilterSelect";

type FilterToolbarProps = {
  controls: readonly FilterControl[];
  className?: string;
};

export default function FilterToolbar({
  controls,
  className,
}: FilterToolbarProps) {
  const {
    clearFilters,
    getFilterValue,
    isPending,
    scheduleSearchUpdate,
    updateFilters,
  } = useUrlFilters();
  const hasActiveFilters = controls.some((control) =>
    Boolean(getFilterValue(control.key))
  );

  return (
    <div
      className={cn(
        "flex flex-col gap-3 md:flex-row md:flex-wrap md:items-center",
        className
      )}
      aria-busy={isPending}
    >
      {controls.map((control) => {
        if (control.type === "search") {
          const searchValue = getFilterValue(control.key);

          return (
            <label
              key={control.key}
              className={cn(
                "relative w-full md:w-72",
                control.className
              )}
            >
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                key={`${control.key}-${searchValue}`}
                defaultValue={searchValue}
                placeholder={control.placeholder}
                className="pl-9"
                aria-label={control.ariaLabel}
                onChange={(event) =>
                  scheduleSearchUpdate(control.key, event.target.value)
                }
              />
            </label>
          );
        }

        if (control.type === "date") {
          return (
            <Input
              key={control.key}
              type="date"
              value={getFilterValue(control.key)}
              className={cn("w-full md:w-auto", control.className)}
              aria-label={control.ariaLabel}
              onChange={(event) =>
                updateFilters({ [control.key]: event.target.value })
              }
            />
          );
        }

        return (
          <UrlFilterSelect
            key={control.key}
            field={control.key}
            label={control.label}
            options={control.options}
            emptyLabel={control.emptyLabel}
            className={cn("w-full md:w-48", control.className)}
          />
        );
      })}

      {hasActiveFilters && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start md:self-auto"
          onClick={() => clearFilters(controls.map((control) => control.key))}
        >
          <RotateCcw /> Reset filters
        </Button>
      )}
    </div>
  );
}

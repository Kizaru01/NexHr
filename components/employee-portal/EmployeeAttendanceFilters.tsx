"use client";

import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import UrlFilterSelect from "@/components/hr/filters/UrlFilterSelect";
import { useUrlFilters } from "@/hooks/use-url-filters";

const statusOptions = [
  "Present",
  "Late",
  "Absent",
  "Half Day",
  "On Leave",
  "Holiday",
  "Weekend",
].map((status) => ({ value: status, label: status }));

export default function EmployeeAttendanceFilters() {
  const { clearFilters, getFilterValue, isPending, scheduleSearchUpdate, updateFilters } =
    useUrlFilters();
  const hasFilters = ["search", "startDate", "endDate", "status"].some((key) =>
    Boolean(getFilterValue(key))
  );

  return (
    <div
      className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center"
      aria-busy={isPending}
    >
      <label className="relative w-full lg:w-72">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          key={`search-${getFilterValue("search")}`}
          defaultValue={getFilterValue("search")}
          className="pl-9"
          placeholder="Search notes"
          aria-label="Search attendance notes"
          onChange={(event) => scheduleSearchUpdate("search", event.target.value)}
        />
      </label>
      <Input
        type="date"
        value={getFilterValue("startDate")}
        aria-label="Attendance range start"
        className="w-full sm:w-auto"
        onChange={(event) => updateFilters({ startDate: event.target.value })}
      />
      <Input
        type="date"
        value={getFilterValue("endDate")}
        min={getFilterValue("startDate") || undefined}
        aria-label="Attendance range end"
        className="w-full sm:w-auto"
        onChange={(event) => updateFilters({ endDate: event.target.value })}
      />
      <UrlFilterSelect
        field="status"
        label="Attendance status"
        emptyLabel="All statuses"
        options={statusOptions}
        className="w-full sm:w-48"
      />
      {hasFilters ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => clearFilters(["search", "startDate", "endDate", "status"])}
        >
          <RotateCcw /> Reset filters
        </Button>
      ) : null}
    </div>
  );
}

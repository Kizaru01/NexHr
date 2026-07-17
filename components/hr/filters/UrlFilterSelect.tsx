"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { FilterOption } from "@/types/filters";

import { useUrlFilters } from "@/hooks/use-url-filters";

const EMPTY_FILTER_VALUE = "__all_filter_values__";

type UrlFilterSelectProps = {
  field: string;
  label: string;
  options: readonly FilterOption[];
  emptyLabel?: string;
  defaultValue?: string;
  className?: string;
};

export default function UrlFilterSelect({
  field,
  label,
  options,
  emptyLabel,
  defaultValue,
  className,
}: UrlFilterSelectProps) {
  const { getFilterValue, updateFilters } = useUrlFilters();
  const currentValue = getFilterValue(field);
  const selectedValue = currentValue || defaultValue || EMPTY_FILTER_VALUE;

  return (
    <Select
      value={selectedValue}
      onValueChange={(value) => {
        const nextValue =
          value === EMPTY_FILTER_VALUE || value === defaultValue ? "" : value;

        updateFilters({ [field]: nextValue });
      }}
    >
      <SelectTrigger className={cn("w-full min-w-40", className)} aria-label={label}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {emptyLabel && (
          <SelectItem value={EMPTY_FILTER_VALUE}>{emptyLabel}</SelectItem>
        )}
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

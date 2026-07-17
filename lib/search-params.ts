import type { FilterValues, PageSearchParams } from "@/types/filters";

export function normaliseSearchParams(searchParams: PageSearchParams): FilterValues {
  return Object.fromEntries(
    Object.entries(searchParams).flatMap(([key, value]) => {
      const parameterValue = Array.isArray(value) ? value[0] : value;

      return parameterValue ? [[key, parameterValue]] : [];
    })
  );
}

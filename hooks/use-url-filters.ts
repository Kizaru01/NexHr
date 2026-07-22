"use client";

import { useCallback, useEffect, useRef, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import type {
  FilterUpdates,
  UseUrlFiltersResult,
} from "@/types/filters";

const SEARCH_DEBOUNCE_MS = 400;

export function useUrlFilters(): UseUrlFiltersResult {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, []);

  const updateFilters = useCallback(
    (updates: FilterUpdates) => {
      const nextSearchParams = new URLSearchParams(searchParams.toString());
      let hasChanges = false;

      Object.entries(updates).forEach(([key, value]) => {
        const normalisedValue = value?.trim() ?? "";
        const currentValue = nextSearchParams.get(key) ?? "";

        if (currentValue === normalisedValue) {
          return;
        }

        hasChanges = true;

        if (normalisedValue) {
          nextSearchParams.set(key, normalisedValue);
        } else {
          nextSearchParams.delete(key);
        }
      });

      if (!hasChanges) {
        return;
      }

      nextSearchParams.delete("page");
      const nextQuery = nextSearchParams.toString();
      const nextUrl = nextQuery ? `${pathname}?${nextQuery}` : pathname;

      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    },
    [pathname, router, searchParams]
  );

  const scheduleSearchUpdate = useCallback(
    (key: string, value: string) => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      searchTimeout.current = setTimeout(() => {
        updateFilters({ [key]: value });
      }, SEARCH_DEBOUNCE_MS);
    },
    [updateFilters]
  );

  const clearFilters = useCallback(
    (keys: readonly string[]) => {
      const updates = Object.fromEntries(keys.map((key) => [key, ""]));

      updateFilters(updates);
    },
    [updateFilters]
  );

  return {
    clearFilters,
    getFilterValue: (key: string) => searchParams.get(key) ?? "",
    isPending,
    scheduleSearchUpdate,
    updateFilters,
  };
}

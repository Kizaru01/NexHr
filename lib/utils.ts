import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: unknown): string {
  if (!date) return "";

  const resolvedDate = date instanceof Date ? date : new Date(date as string);

  if (isNaN(resolvedDate.getTime())) return "";

  return resolvedDate.toISOString().split("T")[0];
}

export function formatDisplayDate(
  value: string | null,
  fallback = "—"
): string {
  return value ? new Date(value).toLocaleDateString() : fallback;
}

export const EMPLOYMENT_TYPES = [
  "Regular",
  "Probationary",
  "Contractual",
  "Intern",
  "Part-time",
] as const;

export const EMPLOYMENT_STATUS = [
  "Active",
  "Inactive",
  "On Leave",
  "Resigned",
  "Terminated",
  "Suspended",
] as const;

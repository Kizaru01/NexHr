import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: unknown) {
  if (!date) return "";

  const d = date instanceof Date ? date : new Date(date as string);

  if (isNaN(d.getTime())) return "";

  return d.toISOString().split("T")[0];
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

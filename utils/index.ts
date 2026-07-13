export {
  departmentOptions,
  positionOptions,
  managerOptions,
} from "./form-options";

export function formatDate(date?: Date) {
  return date ? date.toISOString().split("T")[0] : "";
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

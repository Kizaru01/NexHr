export function formatDate(date: unknown) {
  console.log("formatDate received:", date);
  console.log("typeof:", typeof date);
  console.log("instanceof Date:", date instanceof Date);

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

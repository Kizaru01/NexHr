import type { FilterOption } from "@/types/filters";

export const employmentStatusOptions: readonly FilterOption[] = [
  { label: "Active", value: "Active" },
  { label: "Inactive", value: "Inactive" },
  { label: "On leave", value: "On Leave" },
  { label: "Resigned", value: "Resigned" },
  { label: "Terminated", value: "Terminated" },
  { label: "Suspended", value: "Suspended" },
];

export const attendanceStatusOptions: readonly FilterOption[] = [
  { label: "Present", value: "Present" },
  { label: "Late", value: "Late" },
  { label: "Absent", value: "Absent" },
  { label: "Half day", value: "Half Day" },
  { label: "On leave", value: "On Leave" },
];

export const leaveStatusOptions: readonly FilterOption[] = [
  { label: "Pending", value: "Pending" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
  { label: "Cancelled", value: "Cancelled" },
];

export const leaveTypeOptions: readonly FilterOption[] = [
  { label: "Annual", value: "Annual" },
  { label: "Sick", value: "Sick" },
  { label: "Emergency", value: "Emergency" },
  { label: "Maternity", value: "Maternity" },
  { label: "Paternity", value: "Paternity" },
  { label: "Without pay", value: "Without Pay" },
];

export const employeeSortOptions: readonly FilterOption[] = [
  { label: "Recently added", value: "recently-added" },
  { label: "Name (A–Z)", value: "name-asc" },
  { label: "Name (Z–A)", value: "name-desc" },
  { label: "Hire date (newest)", value: "hire-date-desc" },
  { label: "Hire date (oldest)", value: "hire-date-asc" },
  { label: "Employee ID", value: "employee-id-asc" },
];

export const attendanceSortOptions: readonly FilterOption[] = [
  { label: "Clock in (latest)", value: "clock-in-desc" },
  { label: "Clock in (earliest)", value: "clock-in-asc" },
  { label: "Recently added", value: "recently-added" },
];

export const leaveSortOptions: readonly FilterOption[] = [
  { label: "Recently requested", value: "recently-added" },
  { label: "Start date (soonest)", value: "start-date-asc" },
  { label: "Start date (latest)", value: "start-date-desc" },
];

export const managementStatusOptions: readonly FilterOption[] = [
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
];

export const departmentSortOptions: readonly FilterOption[] = [
  { label: "Name (A–Z)", value: "name-asc" },
  { label: "Name (Z–A)", value: "name-desc" },
  { label: "Recently updated", value: "updated-desc" },
  { label: "Recently added", value: "created-desc" },
];

export const positionSortOptions: readonly FilterOption[] = [
  { label: "Name (A–Z)", value: "name-asc" },
  { label: "Name (Z–A)", value: "name-desc" },
  { label: "Recently updated", value: "updated-desc" },
  { label: "Recently added", value: "created-desc" },
];

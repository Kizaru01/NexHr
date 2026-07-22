import "server-only";

import { Types } from "mongoose";

import { findUserIdsByEmailSearch } from "@/lib/handler/user.helper";
import Employee from "@/models/employee.model";
import type { FilterValues } from "@/types/filters";
import type { SortDefinition } from "@/types/hr-dashboard";

export type ListFilters = FilterValues;
export type { SelectOption, SortDefinition } from "@/types/hr-dashboard";

export const DEFAULT_PAGE_SIZE = 10;

const emptyReferenceFilter = { $in: [] };

export const employeeSorts: Record<string, SortDefinition> = {
  "employee-id-asc": { employeeId: 1 },
  "hire-date-asc": { hireDate: 1 },
  "hire-date-desc": { hireDate: -1 },
  "name-asc": { firstName: 1, lastName: 1 },
  "name-desc": { firstName: -1, lastName: -1 },
  "recently-added": { createdAt: -1 },
};

export const attendanceSorts: Record<string, SortDefinition> = {
  "clock-in-asc": { checkInTime: 1 },
  "clock-in-desc": { checkInTime: -1 },
  "recently-added": { createdAt: -1 },
};

export const leaveSorts: Record<string, SortDefinition> = {
  "recently-added": { createdAt: -1 },
  "start-date-asc": { startDate: 1 },
  "start-date-desc": { startDate: -1 },
};

export const payrollSorts: Record<string, SortDefinition> = {
  "generated-desc": { generatedAt: -1 },
  "generated-asc": { generatedAt: 1 },
  "period-desc": { year: -1, month: -1 },
  "period-asc": { year: 1, month: 1 },
  "net-pay-desc": { netSalary: -1 },
  "net-pay-asc": { netSalary: 1 },
};

export function safePage(value?: string): number {
  return Math.max(Number(value) || 1, 1);
}

export function serialiseDate(value?: Date | null): string | null {
  return value?.toISOString() ?? null;
}

export function nameOf({
  firstName,
  middleName,
  lastName,
}: {
  firstName: string;
  middleName?: string;
  lastName: string;
}): string {
  return [firstName, middleName, lastName].filter(Boolean).join(" ");
}

export function setObjectIdFilter(
  query: Record<string, unknown>,
  field: string,
  value?: string
): void {
  if (!value) {
    return;
  }

  query[field] = Types.ObjectId.isValid(value) ? value : emptyReferenceFilter;
}

export function getDateRange(value?: string): {
  startDate: Date;
  endDate: Date;
} {
  const selectedDate = value ? new Date(`${value}T00:00:00`) : new Date();
  const startDate = Number.isNaN(selectedDate.getTime())
    ? new Date()
    : selectedDate;

  startDate.setHours(0, 0, 0, 0);
  const endDate = new Date(startDate);
  endDate.setDate(endDate.getDate() + 1);

  return { startDate, endDate };
}

export function countStatuses(
  records: Array<{ _id: string; count: number }>
): Record<string, number> {
  return records.reduce<Record<string, number>>((counts, { _id, count }) => {
    counts[_id] = count;
    return counts;
  }, {});
}

export async function findFilteredEmployeeIds(
  filters: ListFilters
): Promise<Types.ObjectId[] | undefined> {
  const { department, search } = filters;
  const employeeQuery: Record<string, unknown> = {};
  const searchTerm = search?.trim();

  setObjectIdFilter(employeeQuery, "department", department);

  if (searchTerm) {
    const matchingUserIds = await findUserIdsByEmailSearch(searchTerm);
    employeeQuery.$or = [
      ...["firstName", "lastName", "employeeId"].map((field) => ({
        [field]: { $regex: searchTerm, $options: "i" },
      })),
      { userId: { $in: matchingUserIds } },
    ];
  }

  if (Object.keys(employeeQuery).length === 0) {
    return undefined;
  }

  return Employee.distinct("_id", employeeQuery);
}

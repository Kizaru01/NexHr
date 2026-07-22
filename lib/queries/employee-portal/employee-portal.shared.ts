import "server-only";

import Leave from "@/models/leave.model";
import {
  leaveDurationInDays,
  leaveEntitlements,
  type LeaveType,
} from "@/lib/queries/policy";
import type {
  EmployeePortalFilters,
  LeaveBalance,
} from "@/types/employee-portal";

export const EMPLOYEE_PORTAL_PAGE_SIZE = 10;

export type { EmployeePortalFilters, LeaveBalance } from "@/types/employee-portal";

export function serialiseDate(value?: Date | null): string | null {
  return value?.toISOString() ?? null;
}

export function safePage(value?: string): number {
  return Math.max(Number(value) || 1, 1);
}

export function getDateBounds(
  year: number,
  month: number
): {
  start: Date;
  end: Date;
} {
  return {
    start: new Date(year, month, 1),
    end: new Date(year, month + 1, 1),
  };
}

export function getTodayBounds(): { start: Date; end: Date } {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);
  return { start, end };
}

export function getSelectedDateRange(filters: EmployeePortalFilters): {
  start?: Date;
  end?: Date;
} {
  const start = filters.startDate
    ? new Date(`${filters.startDate}T00:00:00`)
    : undefined;
  const end = filters.endDate
    ? new Date(`${filters.endDate}T00:00:00`)
    : undefined;

  return {
    start: start && !Number.isNaN(start.getTime()) ? start : undefined,
    end:
      end && !Number.isNaN(end.getTime())
        ? new Date(end.getFullYear(), end.getMonth(), end.getDate() + 1)
        : undefined,
  };
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

export async function getLeaveBalances(
  employeeId: string
): Promise<LeaveBalance[]> {
  const requests = await Leave.find({
    employee: employeeId,
    status: { $in: ["Pending", "Approved"] },
  })
    .select("leaveType startDate endDate status")
    .lean();

  const totals = new Map<LeaveType, { used: number; pending: number }>();
  for (const leaveType of Object.keys(leaveEntitlements) as LeaveType[]) {
    totals.set(leaveType, { used: 0, pending: 0 });
  }

  for (const request of requests) {
    const { endDate, leaveType: requestLeaveType, startDate, status } = request;
    const leaveType = requestLeaveType as LeaveType;
    const total = totals.get(leaveType);
    if (!total) continue;

    const duration = leaveDurationInDays(startDate, endDate);
    if (status === "Approved") total.used += duration;
    if (status === "Pending") total.pending += duration;
  }

  return (Object.keys(leaveEntitlements) as LeaveType[]).map((leaveType) => {
    const entitlement = leaveEntitlements[leaveType];
    const total = totals.get(leaveType)!;

    return {
      leaveType,
      entitlement,
      used: total.used,
      pending: total.pending,
      remaining:
        entitlement === null ? null : Math.max(entitlement - total.used, 0),
      available:
        entitlement === null
          ? null
          : Math.max(entitlement - total.used - total.pending, 0),
    };
  });
}

export function balanceFor(
  balances: readonly LeaveBalance[],
  leaveType: LeaveType
): LeaveBalance {
  const balance = balances.find(
    ({ leaveType: itemLeaveType }) => itemLeaveType === leaveType
  );
  if (!balance) throw new Error(`Missing ${leaveType} leave balance.`);
  return balance;
}

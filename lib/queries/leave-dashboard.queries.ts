import "server-only";

import connectToDatabase from "@/database/mongodb";
import Leave from "@/models/leave.model";
import type { LeaveDashboardResult } from "@/types/hr-dashboard";
import {
  countStatuses,
  DEFAULT_PAGE_SIZE,
  findFilteredEmployeeIds,
  leaveSorts,
  nameOf,
  safePage,
  serialiseDate,
  type ListFilters,
} from "./hr-dashboard.shared";

export async function getLeaveDashboard(
  filters: ListFilters
): Promise<LeaveDashboardResult> {
  const {
    page: pageFilter,
    sort: sortFilter,
    status,
    type,
  } = filters;

  await connectToDatabase();

  const page = safePage(pageFilter);
  const baseQuery: Record<string, unknown> = {};
  const employeeIds = await findFilteredEmployeeIds(filters);

  if (employeeIds) {
    baseQuery.employee = { $in: employeeIds };
  }

  const recordQuery: Record<string, unknown> = { ...baseQuery };

  if (status) {
    recordQuery.status = status;
  }

  if (type) {
    recordQuery.leaveType = type;
  }

  const sort = leaveSorts[sortFilter ?? ""] ?? leaveSorts["recently-added"];
  const [entries, total, statusRecords] = await Promise.all([
    Leave.find(recordQuery)
      .populate({
        path: "employee",
        populate: { path: "department", select: "name" },
      })
      .populate("approvedBy", "email")
      .sort(sort)
      .skip((page - 1) * DEFAULT_PAGE_SIZE)
      .limit(DEFAULT_PAGE_SIZE)
      .lean(),
    Leave.countDocuments(recordQuery),
    Leave.aggregate<{ _id: string; count: number }>([
      { $match: baseQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);
  const statuses = countStatuses(statusRecords);

  return {
    records: entries.flatMap((entry) => {
      if (!entry.employee) {
        return [];
      }

      const employee = entry.employee as unknown as {
        firstName: string;
        middleName?: string;
        lastName: string;
        department?: { name?: string };
      };
      const { department } = employee;

      return [
        {
          id: entry._id.toString(),
          employee: nameOf(employee),
          department: department?.name ?? "Unassigned",
          type: entry.leaveType,
          startDate: serialiseDate(entry.startDate),
          endDate: serialiseDate(entry.endDate),
          reason: entry.reason ?? "—",
          status: entry.status,
          approver:
            (entry.approvedBy as unknown as { email?: string })?.email ?? "—",
          submittedAt: serialiseDate(entry.createdAt),
        },
      ];
    }),
    page,
    totalPages: Math.max(Math.ceil(total / DEFAULT_PAGE_SIZE), 1),
    total,
    stats: {
      pending: statuses.Pending ?? 0,
      approved: statuses.Approved ?? 0,
      rejected: statuses.Rejected ?? 0,
      cancelled: statuses.Cancelled ?? 0,
    },
  };
}

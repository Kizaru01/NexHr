import "server-only";

import { Types } from "mongoose";

import Leave from "@/models/leave.model";
import {
  EMPLOYEE_PORTAL_PAGE_SIZE,
  getLeaveBalances,
  safePage,
  serialiseDate,
  type EmployeePortalFilters,
} from "./employee-portal.shared";

const leaveStatuses = ["Pending", "Approved", "Rejected", "Cancelled"] as const;
const leaveTypes = [
  "Annual",
  "Sick",
  "Emergency",
  "Maternity",
  "Paternity",
  "Without Pay",
] as const;

export async function getOwnLeaveRequests(
  employeeId: string,
  filters: EmployeePortalFilters
) {
  const page = safePage(filters.page);
  const query: Record<string, unknown> = { employee: employeeId };

  if (filters.status && leaveStatuses.includes(filters.status as never)) {
    query.status = filters.status;
  }
  if (filters.type && leaveTypes.includes(filters.type as never)) {
    query.leaveType = filters.type;
  }
  if (filters.search?.trim()) {
    query.reason = { $regex: filters.search.trim(), $options: "i" };
  }

  const [entries, total, balances, statusCounts] = await Promise.all([
    Leave.find(query)
      .select("leaveType startDate endDate reason attachment status approvedBy createdAt")
      .populate("approvedBy", "email")
      .sort({ createdAt: -1 })
      .skip((page - 1) * EMPLOYEE_PORTAL_PAGE_SIZE)
      .limit(EMPLOYEE_PORTAL_PAGE_SIZE)
      .lean(),
    Leave.countDocuments(query),
    getLeaveBalances(employeeId),
    Leave.aggregate<{ _id: string; count: number }>([
      { $match: { employee: new Types.ObjectId(employeeId) } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const counts = Object.fromEntries(statusCounts.map((item) => [item._id, item.count]));

  return {
    records: entries.map((entry) => ({
      id: entry._id.toString(),
      leaveType: entry.leaveType,
      startDate: serialiseDate(entry.startDate),
      endDate: serialiseDate(entry.endDate),
      reason: entry.reason ?? "",
      status: entry.status,
      submittedAt: serialiseDate(entry.createdAt),
      approver: (entry.approvedBy as { email?: string } | null)?.email ?? "—",
      attachmentName: entry.attachment?.name,
    })),
    balances,
    stats: {
      pending: counts.Pending ?? 0,
      approved: counts.Approved ?? 0,
      rejected: counts.Rejected ?? 0,
      cancelled: counts.Cancelled ?? 0,
    },
    page,
    total,
    totalPages: Math.max(Math.ceil(total / EMPLOYEE_PORTAL_PAGE_SIZE), 1),
  };
}

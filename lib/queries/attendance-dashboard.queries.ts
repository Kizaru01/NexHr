import "server-only";

import connectToDatabase from "@/database/mongodb";
import Attendance from "@/models/attendance.model";
import type { AttendanceDashboardResult } from "@/types/hr-dashboard";
import {
  attendanceSorts,
  countStatuses,
  DEFAULT_PAGE_SIZE,
  findFilteredEmployeeIds,
  getDateRange,
  nameOf,
  safePage,
  serialiseDate,
  type ListFilters,
} from "./hr-dashboard.shared";

export async function getAttendanceDashboard(
  filters: ListFilters
): Promise<AttendanceDashboardResult> {
  const {
    date,
    page: pageFilter,
    sort: sortFilter,
    status,
  } = filters;

  await connectToDatabase();

  const page = safePage(pageFilter);
  const { startDate, endDate } = getDateRange(date);
  const baseQuery: Record<string, unknown> = {
    date: { $gte: startDate, $lt: endDate },
  };
  const employeeIds = await findFilteredEmployeeIds(filters);

  if (employeeIds) {
    baseQuery.employee = { $in: employeeIds };
  }

  const recordQuery: Record<string, unknown> = { ...baseQuery };

  if (status) {
    recordQuery.status = status;
  }

  const sort =
    attendanceSorts[sortFilter ?? ""] ?? attendanceSorts["clock-in-desc"];
  const [records, total, statusRecords] = await Promise.all([
    Attendance.find(recordQuery)
      .populate({
        path: "employee",
        populate: [
          { path: "department", select: "name" },
          { path: "position", select: "name" },
        ],
      })
      .sort(sort)
      .skip((page - 1) * DEFAULT_PAGE_SIZE)
      .limit(DEFAULT_PAGE_SIZE)
      .lean(),
    Attendance.countDocuments(recordQuery),
    Attendance.aggregate<{ _id: string; count: number }>([
      { $match: baseQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);
  const statuses = countStatuses(statusRecords);

  return {
    records: records.flatMap((record) => {
      if (!record.employee) {
        return [];
      }

      const employee = record.employee as unknown as {
        employeeId: string;
        firstName: string;
        middleName?: string;
        lastName: string;
        department?: { name?: string };
        position?: { name?: string };
      };
      const { department, employeeId, position } = employee;

      return [
        {
          id: record._id.toString(),
          employeeId,
          employee: nameOf(employee),
          department: department?.name ?? "Unassigned",
          position: position?.name ?? "Unassigned",
          date: serialiseDate(record.date),
          checkIn: serialiseDate(record.checkInTime),
          checkOut: serialiseDate(record.checkOutTime),
          workingHours: record.workingHours ?? 0,
          overtimeHours: record.overtimeHours ?? 0,
          status: record.status,
        },
      ];
    }),
    page,
    totalPages: Math.max(Math.ceil(total / DEFAULT_PAGE_SIZE), 1),
    total,
    stats: {
      present: statuses.Present ?? 0,
      late: statuses.Late ?? 0,
      absent: statuses.Absent ?? 0,
      leave: statuses["On Leave"] ?? 0,
    },
  };
}

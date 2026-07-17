import "server-only";

import { Types } from "mongoose";

import Attendance from "@/models/attendance.model";
import AttendanceCorrection from "@/models/attendance-correction.model";
import {
  EMPLOYEE_PORTAL_PAGE_SIZE,
  getDateBounds,
  getSelectedDateRange,
  safePage,
  serialiseDate,
  type EmployeePortalFilters,
} from "./employee-portal.shared";

const attendanceStatuses = [
  "Present",
  "Absent",
  "On Leave",
  "Half Day",
  "Holiday",
  "Late",
  "Weekend",
] as const;

export async function getOwnAttendance(
  employeeId: string,
  filters: EmployeePortalFilters
) {
  const page = safePage(filters.page);
  const { start, end } = getSelectedDateRange(filters);
  const query: Record<string, unknown> = { employee: employeeId };

  if (start || end) {
    query.date = {
      ...(start ? { $gte: start } : {}),
      ...(end ? { $lt: end } : {}),
    };
  }

  if (filters.status && attendanceStatuses.includes(filters.status as never)) {
    query.status = filters.status;
  }

  if (filters.search?.trim()) {
    query.remarks = { $regex: filters.search.trim(), $options: "i" };
  }

  const [records, total] = await Promise.all([
    Attendance.find(query)
      .select("date checkInTime checkOutTime breakDuration workingHours overtimeHours status remarks")
      .sort({ date: -1 })
      .skip((page - 1) * EMPLOYEE_PORTAL_PAGE_SIZE)
      .limit(EMPLOYEE_PORTAL_PAGE_SIZE)
      .lean(),
    Attendance.countDocuments(query),
  ]);

  return {
    records: records.map((record) => ({
      id: record._id.toString(),
      date: serialiseDate(record.date),
      checkIn: serialiseDate(record.checkInTime),
      checkOut: serialiseDate(record.checkOutTime),
      breakDuration: record.breakDuration ?? 0,
      workingHours: record.workingHours ?? 0,
      overtimeHours: record.overtimeHours ?? 0,
      status: record.status,
      remarks: record.remarks,
    })),
    page,
    total,
    totalPages: Math.max(Math.ceil(total / EMPLOYEE_PORTAL_PAGE_SIZE), 1),
  };
}

export async function getOwnAttendanceSummary(employeeId: string) {
  const now = new Date();
  const month = getDateBounds(now.getFullYear(), now.getMonth());
  const records = await Attendance.find({
    employee: employeeId,
    date: { $gte: month.start, $lt: month.end },
  })
    .select("status overtimeHours")
    .lean();

  const count = (statuses: readonly string[]) =>
    records.filter((record) => statuses.includes(record.status)).length;
  const trackedDays = records.filter(
    (record) => !["Holiday", "Weekend", "On Leave"].includes(record.status)
  ).length;
  const attended = count(["Present", "Late", "Half Day"]);

  return {
    present: count(["Present", "Half Day"]),
    late: count(["Late"]),
    absent: count(["Absent"]),
    overtimeHours: records.reduce(
      (total, record) => total + (record.overtimeHours ?? 0),
      0
    ),
    attendanceRate: trackedDays ? Math.round((attended / trackedDays) * 100) : 0,
  };
}

export async function getOwnAttendanceDetail(employeeId: string, attendanceId: string) {
  if (!Types.ObjectId.isValid(attendanceId)) return null;

  const [attendance, correction] = await Promise.all([
    Attendance.findOne({ _id: attendanceId, employee: employeeId })
      .select("date checkInTime checkOutTime breakDuration workingHours overtimeHours status remarks")
      .lean(),
    AttendanceCorrection.findOne({
      attendance: attendanceId,
      employee: employeeId,
      status: "Pending",
    })
      .select("_id")
      .lean(),
  ]);

  if (!attendance) return null;

  return {
    id: attendance._id.toString(),
    date: serialiseDate(attendance.date),
    checkIn: serialiseDate(attendance.checkInTime),
    checkOut: serialiseDate(attendance.checkOutTime),
    breakDuration: attendance.breakDuration ?? 0,
    workingHours: attendance.workingHours ?? 0,
    overtimeHours: attendance.overtimeHours ?? 0,
    status: attendance.status,
    remarks: attendance.remarks,
    hasPendingCorrection: Boolean(correction),
  };
}

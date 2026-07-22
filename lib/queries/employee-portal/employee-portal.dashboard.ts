import "server-only";

import Announcement from "@/models/announcement.model";
import Attendance from "@/models/attendance.model";
import Holiday from "@/models/holiday.model";
import Leave from "@/models/leave.model";
import type { EmployeeDashboardResult } from "@/types/employee-portal";
import {
  getDateBounds,
  getLeaveBalances,
  getTodayBounds,
  serialiseDate,
} from "./employee-portal.shared";

export async function getEmployeeDashboard(
  employeeId: string
): Promise<EmployeeDashboardResult> {
  const now = new Date();
  const month = getDateBounds(now.getFullYear(), now.getMonth());
  const today = getTodayBounds();
  const [todayAttendance, monthAttendance, pendingLeaves, balances, recentLeaves, announcements, holidays] =
    await Promise.all([
      Attendance.findOne({ employee: employeeId, date: { $gte: today.start, $lt: today.end } })
        .select("date checkInTime checkOutTime breakDuration workingHours overtimeHours status remarks")
        .lean(),
      Attendance.find({ employee: employeeId, date: { $gte: month.start, $lt: month.end } })
        .select("status overtimeHours")
        .lean(),
      Leave.countDocuments({ employee: employeeId, status: "Pending" }),
      getLeaveBalances(employeeId),
      Leave.find({ employee: employeeId })
        .select("leaveType startDate endDate status createdAt")
        .sort({ createdAt: -1 })
        .limit(5)
        .lean(),
      Announcement.find({ isPublished: true, isArchived: { $ne: true } })
        .select("title category priority description publishedAt")
        .sort({ publishedAt: -1 })
        .limit(4)
        .lean(),
      Holiday.find({ date: { $gte: today.start } })
        .select("name date description")
        .sort({ date: 1 })
        .limit(4)
        .lean(),
    ]);

  const attended = monthAttendance.filter((record) =>
    ["Present", "Late", "Half Day"].includes(record.status)
  ).length;
  const trackedDays = monthAttendance.filter(
    (record) => !["Holiday", "Weekend", "On Leave"].includes(record.status)
  ).length;
  const overtimeHours = monthAttendance.reduce(
    (total, record) => total + (record.overtimeHours ?? 0),
    0
  );
  const remainingLeave = balances.reduce(
    (total, balance) => total + (balance.remaining ?? 0),
    0
  );

  return {
    stats: {
      attendanceToday: todayAttendance?.status ?? "Not recorded",
      remainingLeave,
      monthlyAttendance: `${attended}/${trackedDays || 0}`,
      overtimeHours,
      pendingLeaves,
    },
    todayAttendance: todayAttendance
      ? {
          status: todayAttendance.status,
          checkIn: serialiseDate(todayAttendance.checkInTime),
          checkOut: serialiseDate(todayAttendance.checkOutTime),
          breakDuration: todayAttendance.breakDuration ?? 0,
          workingHours: todayAttendance.workingHours ?? 0,
          overtimeHours: todayAttendance.overtimeHours ?? 0,
          remarks: todayAttendance.remarks,
        }
      : null,
    balances,
    attendanceRate: trackedDays ? Math.round((attended / trackedDays) * 100) : 0,
    recentLeaves: recentLeaves.map((leave) => ({
      id: leave._id.toString(),
      leaveType: leave.leaveType,
      startDate: serialiseDate(leave.startDate),
      endDate: serialiseDate(leave.endDate),
      status: leave.status,
      submittedAt: serialiseDate(leave.createdAt),
    })),
    announcements: announcements.map((announcement) => ({
      id: announcement._id.toString(),
      title: announcement.title,
      category: announcement.category,
      priority: announcement.priority,
      description: announcement.description,
      publishedAt: serialiseDate(announcement.publishedAt),
    })),
    holidays: holidays.map((holiday) => ({
      id: holiday._id.toString(),
      name: holiday.name,
      date: serialiseDate(holiday.date),
      description: holiday.description,
    })),
  };
}

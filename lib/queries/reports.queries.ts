import "server-only";

import connectToDatabase from "@/database/mongodb";
import Attendance from "@/models/attendance.model";
import Employee from "@/models/employee.model";
import Leave from "@/models/leave.model";
import Payroll from "@/models/payroll.model";
import handleError from "@/lib/handler/error";
import { getDateBounds } from "./employee-portal/employee-portal.shared";
import type {
  AttendanceReportsResult,
  EmployeeReportsResult,
  LeaveReportsResult,
  PayrollReportsResult,
} from "@/types/hr-dashboard";
import type { ActionResponse } from "@/types/global";

export async function getEmployeeReports(): Promise<
  ActionResponse<EmployeeReportsResult>
> {
  try {
    await connectToDatabase();

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const nextMonthStart = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const [total, active, inactive, newHires, resigned, departments] =
      await Promise.all([
        Employee.countDocuments(),
        Employee.countDocuments({ employmentStatus: "Active" }),
        Employee.countDocuments({ employmentStatus: "Inactive" }),
        Employee.countDocuments({
          hireDate: { $gte: monthStart, $lt: nextMonthStart },
        }),
        Employee.countDocuments({ employmentStatus: "Resigned" }),
        Employee.aggregate<{
          _id: { name?: string } | null;
          employees: number;
          activeEmployees: number;
        }>([
          {
            $group: {
              _id: "$department",
              employees: { $sum: 1 },
              activeEmployees: {
                $sum: {
                  $cond: [{ $eq: ["$employmentStatus", "Active"] }, 1, 0],
                },
              },
            },
          },
          {
            $lookup: {
              from: "departments",
              localField: "_id",
              foreignField: "_id",
              as: "department",
            },
          },
          {
            $unwind: {
              path: "$department",
              preserveNullAndEmptyArrays: true,
            },
          },
          {
            $project: {
              _id: { name: "$department.name" },
              employees: 1,
              activeEmployees: 1,
            },
          },
          { $sort: { employees: -1, "_id.name": 1 } },
        ]),
      ]);

    return {
      success: true,
      data: {
        stats: { total, active, inactive, newHires, resigned },
        departments: departments.map((department) => ({
          name: department._id?.name ?? "Unassigned",
          employees: department.employees,
          activeEmployees: department.activeEmployees,
        })),
        period: new Intl.DateTimeFormat("en", {
          month: "long",
          year: "numeric",
        }).format(now),
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function getAttendanceReports(
  monthFilter?: string
): Promise<AttendanceReportsResult> {
  await connectToDatabase();

  const now = new Date();
  const requestedMonth = Number(monthFilter);
  const month =
    Number.isInteger(requestedMonth) &&
    requestedMonth >= 1 &&
    requestedMonth <= 12
      ? requestedMonth
      : now.getMonth() + 1;
  const { start, end } = getDateBounds(now.getFullYear(), month - 1);
  const match = { date: { $gte: start, $lt: end } };
  const [statuses, dailyRecords] = await Promise.all([
    Attendance.aggregate<{ _id: string; count: number }>([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Attendance.aggregate<{
      _id: string;
      present: number;
      late: number;
      absent: number;
      overtimeHours: number;
    }>([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
          present: {
            $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] },
          },
          late: {
            $sum: { $cond: [{ $eq: ["$status", "Late"] }, 1, 0] },
          },
          absent: {
            $sum: { $cond: [{ $eq: ["$status", "Absent"] }, 1, 0] },
          },
          overtimeHours: { $sum: { $ifNull: ["$overtimeHours", 0] } },
        },
      },
      { $sort: { _id: 1 } },
    ]),
  ]);
  const counts = statuses.reduce<Record<string, number>>((result, status) => {
    result[status._id] = status.count;
    return result;
  }, {});
  const present = counts.Present ?? 0;
  const late = counts.Late ?? 0;
  const halfDay = counts["Half Day"] ?? 0;
  const absences = counts.Absent ?? 0;
  const trackedRecords = present + late + halfDay + absences;
  const attendanceRate = trackedRecords
    ? Math.round(((present + late + halfDay) / trackedRecords) * 100)
    : 0;

  return {
    stats: {
      attendanceRate,
      late,
      absences,
      overtimeHours: dailyRecords.reduce(
        (total, record) => total + record.overtimeHours,
        0
      ),
    },
    dailyRecords: dailyRecords.map((record) => ({
      date: record._id,
      present: record.present,
      late: record.late,
      absent: record.absent,
      overtimeHours: record.overtimeHours,
    })),
    period: new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric",
    }).format(new Date(now.getFullYear(), month - 1, 1)),
  };
}

export async function getLeaveReports(
  yearFilter?: string
): Promise<LeaveReportsResult> {
  await connectToDatabase();

  const currentYear = new Date().getFullYear();
  const requestedYear = Number(yearFilter);
  const year =
    Number.isInteger(requestedYear) && requestedYear >= 2000
      ? requestedYear
      : currentYear;
  const match = {
    startDate: {
      $gte: new Date(year, 0, 1),
      $lt: new Date(year + 1, 0, 1),
    },
  };
  const [statuses, leaveTypes] = await Promise.all([
    Leave.aggregate<{ _id: string; count: number }>([
      { $match: match },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
    Leave.aggregate<{
      _id: string;
      total: number;
      pending: number;
      approved: number;
      rejected: number;
    }>([
      { $match: match },
      {
        $group: {
          _id: "$leaveType",
          total: { $sum: 1 },
          pending: {
            $sum: { $cond: [{ $eq: ["$status", "Pending"] }, 1, 0] },
          },
          approved: {
            $sum: { $cond: [{ $eq: ["$status", "Approved"] }, 1, 0] },
          },
          rejected: {
            $sum: { $cond: [{ $eq: ["$status", "Rejected"] }, 1, 0] },
          },
        },
      },
      { $sort: { total: -1, _id: 1 } },
    ]),
  ]);
  const counts = statuses.reduce<Record<string, number>>((result, status) => {
    result[status._id] = status.count;
    return result;
  }, {});

  return {
    year,
    stats: {
      pending: counts.Pending ?? 0,
      approved: counts.Approved ?? 0,
      rejected: counts.Rejected ?? 0,
    },
    leaveTypes: leaveTypes.map((leaveType) => ({
      name: leaveType._id,
      total: leaveType.total,
      pending: leaveType.pending,
      approved: leaveType.approved,
      rejected: leaveType.rejected,
    })),
  };
}

export async function getPayrollReports(
  monthFilter?: string
): Promise<PayrollReportsResult> {
  await connectToDatabase();

  const now = new Date();
  const requestedMonth = Number(monthFilter);
  const month =
    Number.isInteger(requestedMonth) &&
    requestedMonth >= 1 &&
    requestedMonth <= 12
      ? requestedMonth
      : now.getMonth() + 1;
  const match = { month, year: now.getFullYear() };
  const [summary, departments] = await Promise.all([
    Payroll.aggregate<{
      _id: null;
      payrolls: number;
      grossPay: number;
      deductions: number;
      netPay: number;
    }>([
      { $match: match },
      {
        $group: {
          _id: null,
          payrolls: { $sum: 1 },
          grossPay: {
            $sum: {
              $add: ["$basicSalary", "$allowance", "$overtimePay", "$bonus"],
            },
          },
          deductions: { $sum: { $add: ["$deductions", "$tax"] } },
          netPay: { $sum: "$netSalary" },
        },
      },
    ]),
    Payroll.aggregate<{
      _id: string | null;
      grossPay: number;
      netPay: number;
      payrolls: number;
    }>([
      { $match: match },
      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employee",
        },
      },
      { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "departments",
          localField: "employee.department",
          foreignField: "_id",
          as: "department",
        },
      },
      { $unwind: { path: "$department", preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: "$department.name",
          grossPay: {
            $sum: {
              $add: ["$basicSalary", "$allowance", "$overtimePay", "$bonus"],
            },
          },
          netPay: { $sum: "$netSalary" },
          payrolls: { $sum: 1 },
        },
      },
      { $sort: { netPay: -1, _id: 1 } },
    ]),
  ]);
  const totals = summary[0];

  return {
    stats: {
      payrolls: totals?.payrolls ?? 0,
      grossPay: totals?.grossPay ?? 0,
      deductions: totals?.deductions ?? 0,
      netPay: totals?.netPay ?? 0,
    },
    departments: departments.map((department) => ({
      name: department._id ?? "Unassigned",
      grossPay: department.grossPay,
      netPay: department.netPay,
      payrolls: department.payrolls,
    })),
    month,
    year: now.getFullYear(),
    period: new Intl.DateTimeFormat("en", {
      month: "long",
      year: "numeric",
    }).format(new Date(now.getFullYear(), month - 1, 1)),
  };
}

import type { IAnnouncement } from "@/models/announcement.model";
import type { IAttendance } from "@/models/attendance.model";
import type { IEmployee } from "@/models/employee.model";
import type { ILeave } from "@/models/leave.model";
import type { INotification } from "@/models/notification.model";
import type { LeaveType } from "@/lib/queries/policy";
import type { LeaveRequestInput } from "@/validations/employee-portal.schema";

export type EmployeePortalFilters = Record<string, string | undefined>;

export type LeaveBalance = {
  leaveType: LeaveType;
  entitlement: number | null;
  used: number;
  pending: number;
  remaining: number | null;
  available: number | null;
};

export type EmployeeAttendanceRecord = {
  id: string;
  date: string | null;
  checkIn: string | null;
  checkOut: string | null;
  breakDuration: number;
  workingHours: number;
  overtimeHours: number;
  status: IAttendance["status"];
  remarks?: string;
};

export type EmployeeAttendanceResult = {
  records: EmployeeAttendanceRecord[];
  page: number;
  total: number;
  totalPages: number;
};

export type EmployeeAttendanceSummary = {
  present: number;
  late: number;
  absent: number;
  overtimeHours: number;
  attendanceRate: number;
};

export type EmployeeAttendanceDetail = EmployeeAttendanceRecord & {
  hasPendingCorrection: boolean;
};

export type EmployeeLeaveRecord = {
  id: string;
  leaveType: ILeave["leaveType"];
  startDate: string | null;
  endDate: string | null;
  reason: string;
  status: ILeave["status"];
  submittedAt: string | null;
  approver: string;
  attachmentName?: string;
};

export type LeaveRecordForForm = Pick<
  EmployeeLeaveRecord,
  "id" | "leaveType" | "startDate" | "endDate" | "reason"
>;

export type EmployeeLeaveResult = {
  records: EmployeeLeaveRecord[];
  balances: LeaveBalance[];
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
  };
  page: number;
  total: number;
  totalPages: number;
};

export type EmployeePayrollRecord = {
  id: string;
  month: number;
  year: number;
  basicSalary: number;
  allowance: number;
  overtimePay: number;
  bonus: number;
  deductions: number;
  taxes: number;
  netPay: number;
  generatedAt: string | null;
};

export type EmployeePayrollResult = {
  currentSalary: number | null;
  latest: {
    netPay: number;
    deductions: number;
    taxes: number;
    period: string;
  } | null;
  payrolls: EmployeePayrollRecord[];
};

export type NotificationPreferences = {
  leave: boolean;
  attendance: boolean;
  announcements: boolean;
  payroll: boolean;
  email: boolean;
};

export type EmployeeProfileResult = {
  employeeId: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  birthDate: string | null;
  gender?: IEmployee["gender"];
  avatar?: string;
  address?: IEmployee["address"];
  emergencyContact?: IEmployee["emergencyContact"];
  department: string;
  position: string;
  manager: string;
  hireDate: string | null;
  status: IEmployee["employmentStatus"];
  type: IEmployee["employmentType"];
  notification: NotificationPreferences;
};

export type OwnProfileFormProfile = Pick<
  EmployeeProfileResult,
  | "firstName"
  | "middleName"
  | "lastName"
  | "email"
  | "phone"
  | "birthDate"
  | "gender"
  | "address"
  | "emergencyContact"
>;

export type EmployeeAnnouncement = {
  id: string;
  title: string;
  description: string;
  category: IAnnouncement["category"];
  priority: IAnnouncement["priority"];
  publishedAt: string | null;
};

export type EmployeeAnnouncementDetail = EmployeeAnnouncement & {
  createdAt: string | null;
};

export type EmployeeAnnouncementsResult = {
  announcements: EmployeeAnnouncement[];
  stats: {
    total: number;
    highPriority: number;
  };
  page: number;
  total: number;
  totalPages: number;
};

export type EmployeeNotification = {
  id: string;
  type: INotification["type"];
  title: string;
  description: string;
  href?: string;
  isRead: boolean;
  createdAt: string | null;
};

export type EmployeeNotificationsResult = {
  unread: number;
  total: number;
  notifications: EmployeeNotification[];
};

export type EmployeeDashboardResult = {
  stats: {
    attendanceToday: IAttendance["status"] | "Not recorded";
    remainingLeave: number;
    monthlyAttendance: string;
    overtimeHours: number;
    pendingLeaves: number;
  };
  todayAttendance: {
    status: IAttendance["status"];
    checkIn: string | null;
    checkOut: string | null;
    breakDuration: number;
    workingHours: number;
    overtimeHours: number;
    remarks?: string;
  } | null;
  balances: LeaveBalance[];
  attendanceRate: number;
  recentLeaves: Array<{
    id: string;
    leaveType: ILeave["leaveType"];
    startDate: string | null;
    endDate: string | null;
    status: ILeave["status"];
    submittedAt: string | null;
  }>;
  announcements: EmployeeAnnouncement[];
  holidays: Array<{
    id: string;
    name: string;
    date: string | null;
    description?: string;
  }>;
};

export type LeaveNotificationParams = {
  employeeId: string;
  type: "Leave Approved" | "Leave Rejected";
  title: string;
  description: string;
};

export type LeaveAvailabilityParams = {
  employeeId: string;
  values: LeaveRequestInput;
  excludeLeaveId?: string;
  existingDuration?: number;
};

import type { IAnnouncement } from "@/models/announcement.model";
import type { IAttendance } from "@/models/attendance.model";
import type { IEmployee } from "@/models/employee.model";
import type { ILeave } from "@/models/leave.model";

export type SelectOption = {
  value: string;
  label: string;
};

export type SortDefinition = Record<string, 1 | -1>;

export type PaginatedRecords<T> = {
  records: T[];
  page: number;
  totalPages: number;
  total: number;
};

export type EmployeeFilterOptions = {
  departments: SelectOption[];
  positions: SelectOption[];
};

export type EmployeeDirectoryRecord = {
  id: string;
  employeeId: string;
  name: string;
  avatar?: string;
  department: string;
  position: string;
  status: IEmployee["employmentStatus"];
  type: IEmployee["employmentType"];
  hireDate: string | null;
  email: string;
  phone?: string;
  manager: string;
};

export type EmployeeDirectoryResult = {
  employees: EmployeeDirectoryRecord[];
  page: number;
  totalPages: number;
  total: number;
};

export type EmployeeProfileResult = {
  employeeId: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  gender?: IEmployee["gender"];
  birthDate: string | null;
  department: string;
  position: string;
  hireDate: string | null;
  status: IEmployee["employmentStatus"];
  type: IEmployee["employmentType"];
  manager: string;
  address?: IEmployee["address"];
  emergencyContact?: IEmployee["emergencyContact"];
  createdAt: string | null;
  updatedAt: string | null;
  notes?: string;
};

export type AttendanceDashboardRecord = {
  id: string;
  employeeId: string;
  employee: string;
  department: string;
  position: string;
  date: string | null;
  checkIn: string | null;
  checkOut: string | null;
  workingHours: number;
  overtimeHours: number;
  status: IAttendance["status"];
};

export type AttendanceDashboardResult =
  PaginatedRecords<AttendanceDashboardRecord> & {
    stats: {
      present: number;
      late: number;
      absent: number;
      leave: number;
    };
  };

export type LeaveDashboardRecord = {
  id: string;
  employee: string;
  department: string;
  type: ILeave["leaveType"];
  startDate: string | null;
  endDate: string | null;
  reason: string;
  status: ILeave["status"];
  approver: string;
  submittedAt: string | null;
};

export type LeaveDashboardResult = PaginatedRecords<LeaveDashboardRecord> & {
  stats: {
    pending: number;
    approved: number;
    rejected: number;
    cancelled: number;
  };
};

export type PayrollListRecord = {
  id: string;
  employee: string;
  employeeId: string;
  department: string;
  position: string;
  month: number;
  year: number;
  grossPay: number;
  deductions: number;
  tax: number;
  netSalary: number;
  generatedAt: string | null;
};

export type PayrollGenerationEmployee = {
  id: string;
  label: string;
};

export type PayrollDetailResult = {
  id: string;
  employee: string;
  employeeId: string;
  email: string | null;
  department: string;
  position: string;
  month: number;
  year: number;
  basicSalary: number;
  allowance: number;
  overtimePay: number;
  bonus: number;
  deductions: number;
  tax: number;
  netSalary: number;
  generatedAt: string | null;
  remarks: string | null;
};

export type PayrollDashboardResult = PaginatedRecords<PayrollListRecord> & {
  stats: {
    processed: number;
    totalNetPay: number;
    averageNetPay: number;
  };
};

export type AnnouncementDashboardRecord = {
  id: string;
  title: string;
  description: string;
  category: IAnnouncement["category"];
  priority: IAnnouncement["priority"];
  state: "Archived" | "Published" | "Draft";
  isPublished: boolean;
  isArchived: boolean;
  publishedAt: string | null;
  createdAt: string | null;
};

export type AnnouncementDashboardResult = {
  announcements: AnnouncementDashboardRecord[];
  stats: {
    published: number;
    drafts: number;
    highPriority: number;
  };
  page: number;
  totalPages: number;
  total: number;
};

export type EditableAnnouncement = {
  id: string;
  title: string;
  description: string;
  category: IAnnouncement["category"];
  priority: IAnnouncement["priority"];
  isPublished: boolean;
};

export type EmployeeReportsResult = {
  stats: {
    total: number;
    active: number;
    inactive: number;
    newHires: number;
    resigned: number;
  };
  departments: Array<{
    name: string;
    employees: number;
    activeEmployees: number;
  }>;
  period: string;
};

export type AttendanceReportsResult = {
  stats: {
    attendanceRate: number;
    late: number;
    absences: number;
    overtimeHours: number;
  };
  dailyRecords: Array<{
    date: string;
    present: number;
    late: number;
    absent: number;
    overtimeHours: number;
  }>;
  period: string;
};

export type LeaveReportsResult = {
  year: number;
  stats: {
    pending: number;
    approved: number;
    rejected: number;
  };
  leaveTypes: Array<{
    name: string;
    total: number;
    pending: number;
    approved: number;
    rejected: number;
  }>;
};

export type PayrollReportsResult = {
  stats: {
    payrolls: number;
    grossPay: number;
    deductions: number;
    netPay: number;
  };
  departments: Array<{
    name: string;
    grossPay: number;
    netPay: number;
    payrolls: number;
  }>;
  month: number;
  year: number;
  period: string;
};

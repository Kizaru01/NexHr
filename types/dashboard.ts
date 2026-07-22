import type { LucideIcon } from "lucide-react";

export interface DashboardStat {
  title: string;
  value: number;
  change: string;
  color: string;
  icon: LucideIcon;
}

export interface EmployeeOverviewData {
  day: string;
  activeEmployees: number;
  newHires: number;
}

export interface AttendanceOverviewData {
  day: string;
  present: number;
  late: number;
  absent: number;
}
export interface LeaveRequest {
  id: number;
  employee: string;
  avatar: string;
  leaveType: string;
  startDate: string;
  endDate: string;
  status: "Approved" | "Pending" | "Rejected";
}

export type StatCardProps = {
  label: string;
  value?: string | number;
  dashboardValue?: number;
  icon: LucideIcon;
};

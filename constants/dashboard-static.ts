import {
  CalendarPlus,
  CircleCheck,
  FileBarChart,
  FileLock,
  Megaphone,
  Plane,
  User,
  UserPlus,
  Wallet,
} from "lucide-react";

import type {
  AttendanceOverviewData,
  DashboardStat,
  EmployeeOverviewData,
  LeaveRequest,
} from "@/types/dashboard";

export const employeeGrowth = [
  { month: "Jan", employees: 82 },
  { month: "Feb", employees: 90 },
  { month: "Mar", employees: 96 },
  { month: "Apr", employees: 104 },
  { month: "May", employees: 116 },
  { month: "Jun", employees: 128 },
];

export const dashboardStats: DashboardStat[] = [
  {
    title: "Total Employees",
    value: 128,
    change: "+12 this month",
    color: "text-blue-600",
    icon: User,
  },
  {
    title: "Present Today",
    value: 96,
    change: "75% of total",
    color: "text-green-600",
    icon: CircleCheck,
  },
  {
    title: "On Leave",
    value: 15,
    change: "11.7% of total",
    color: "text-yellow-600",
    icon: Plane,
  },
  {
    title: "Pending Requests",
    value: 8,
    change: "Requires action",
    color: "text-red-600",
    icon: FileLock,
  },
];

export const employeeOverview: EmployeeOverviewData[] = [
  {
    day: "1",
    activeEmployees: 75,
    newHires: 50,
  },
  {
    day: "5",
    activeEmployees: 100,
    newHires: 65,
  },
  {
    day: "10",
    activeEmployees: 110,
    newHires: 68,
  },
  {
    day: "15",
    activeEmployees: 112,
    newHires: 70,
  },
  {
    day: "20",
    activeEmployees: 112,
    newHires: 70,
  },
  {
    day: "25",
    activeEmployees: 122,
    newHires: 74,
  },
  {
    day: "30",
    activeEmployees: 124,
    newHires: 68,
  },
];

export const attendanceOverview: AttendanceOverviewData[] = [
  {
    day: "Sun",
    present: 85,
    late: 10,
    absent: 2,
  },
  {
    day: "Mon",
    present: 75,
    late: 12,
    absent: 3,
  },
  {
    day: "Tue",
    present: 72,
    late: 10,
    absent: 8,
  },
  {
    day: "Wed",
    present: 68,
    late: 13,
    absent: 1,
  },
  {
    day: "Thu",
    present: 76,
    late: 10,
    absent: 2,
  },
  {
    day: "Fri",
    present: 60,
    late: 13,
    absent: 9,
  },
  {
    day: "Sat",
    present: 72,
    late: 9,
    absent: 10,
  },
];

export const LeaveStatus = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
} as const;

export const recentLeaveRequests: LeaveRequest[] = [
  {
    id: 1,
    employee: "Charles Evangelista",
    avatar: "/avatars/avatar-1.png",
    leaveType: "Vacation",
    startDate: "Jul 10",
    endDate: "Jul 12",
    status: LeaveStatus.PENDING,
  },
  {
    id: 2,
    employee: "John Doe",
    avatar: "/avatars/avatar-2.png",
    leaveType: "Sick",
    startDate: "Jul 5",
    endDate: "Jul 5",
    status: LeaveStatus.APPROVED,
  },
  {
    id: 3,
    employee: "Maria Cruz",
    avatar: "/avatars/avatar-3.png",
    leaveType: "Emergency",
    startDate: "Jul 15",
    endDate: "Jul 16",
    status: LeaveStatus.APPROVED,
  },
];
export const quickActions = [
  {
    id: 1,
    title: "Add Employee",
    description: "Register a new employee",
    icon: UserPlus,
    href: "/employees/new",
  },
  {
    id: 2,
    title: "Leave Requests",
    description: "Review leave applications",
    icon: CalendarPlus,
    href: "/leave",
  },
  {
    id: 3,
    title: "Generate Payroll",
    description: "Create monthly payroll",
    icon: Wallet,
    href: "/payroll",
  },
  {
    id: 4,
    title: "Create Announcement",
    description: "Publish company news",
    icon: Megaphone,
    href: "/announcements/create",
  },
  {
    id: 5,
    title: "Reports",
    description: "View HR reports",
    icon: FileBarChart,
    href: "/reports",
  },
];

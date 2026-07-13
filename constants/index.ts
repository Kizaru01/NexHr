import {
  LayoutDashboard,
  Users,
  Building2,
  BriefcaseBusiness,
  ShieldCheck,
  CalendarCheck,
  Wallet,
  Megaphone,
  BarChart3,
  UserCog,
  Settings,
  ClipboardList,
} from "lucide-react";

export const sidebarLinks = [
  {
    title: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Employees",
    href: "/employees",
    icon: Users,
  },
  {
    title: "Departments",
    href: "/departments",
    icon: Building2,
  },
  {
    title: "Positions",
    href: "/positions",
    icon: BriefcaseBusiness,
  },
  {
    title: "Attendance",
    href: "/attendance",
    icon: ShieldCheck,
  },
  {
    title: "Leave Requests",
    href: "/leave-requests",
    icon: CalendarCheck,
  },
  {
    title: "Payroll",
    href: "/payroll",
    icon: Wallet,
  },
  {
    title: "Announcements",
    href: "/announcements",
    icon: Megaphone,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: BarChart3,
  },
  {
    title: "Users & Roles",
    href: "/users",
    icon: UserCog,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
  {
    title: "Audit Logs",
    href: "/audit-logs",
    icon: ClipboardList,
  },
] as const;

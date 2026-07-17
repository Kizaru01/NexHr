import type { LucideIcon } from "lucide-react";
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
  UserRound,
  Bell,
} from "lucide-react";

export type NavigationItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

export type NavigationSection = {
  title: string;
  items: readonly NavigationItem[];
};

export const navigationSections: readonly NavigationSection[] = [
  {
    title: "Overview",
    items: [{ title: "Dashboard", href: "/", icon: LayoutDashboard }],
  },
  {
    title: "Management",
    items: [
      { title: "Employees", href: "/employees", icon: Users },
      { title: "Departments", href: "/departments", icon: Building2 },
      { title: "Positions", href: "/positions", icon: BriefcaseBusiness },
    ],
  },
  {
    title: "Workforce",
    items: [
      { title: "Attendance", href: "/attendance", icon: ShieldCheck },
      { title: "Leave Requests", href: "/leave-requests", icon: CalendarCheck },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Payroll", href: "/payroll", icon: Wallet },
      { title: "Announcements", href: "/announcements", icon: Megaphone },
      { title: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    title: "Administration",
    items: [
      { title: "Users & Roles", href: "/users", icon: UserCog },
      { title: "Settings", href: "/settings", icon: Settings },
      { title: "Audit Logs", href: "/audit-logs", icon: ClipboardList },
    ],
  },
];

export const sidebarLinks = navigationSections.flatMap((section) => section.items);

export const employeeNavigationSections: readonly NavigationSection[] = [
  {
    title: "Overview",
    items: [{ title: "Dashboard", href: "/employee", icon: LayoutDashboard }],
  },
  {
    title: "My work",
    items: [
      { title: "My Profile", href: "/employee/profile", icon: UserRound },
      { title: "Attendance", href: "/employee/attendance", icon: ShieldCheck },
      { title: "Leave Requests", href: "/employee/leave", icon: CalendarCheck },
      { title: "Payroll", href: "/employee/payroll", icon: Wallet },
    ],
  },
  {
    title: "Stay informed",
    items: [
      { title: "Announcements", href: "/employee/announcements", icon: Megaphone },
      { title: "Notifications", href: "/employee/notifications", icon: Bell },
      { title: "Settings", href: "/employee/settings", icon: Settings },
    ],
  },
];

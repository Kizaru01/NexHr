import "server-only";

import Employee from "@/models/employee.model";
import User from "@/models/user.model";
import type { EmployeeProfileResult } from "@/types/employee-portal";
import { nameOf, serialiseDate } from "./employee-portal.shared";

export async function getOwnEmployeeProfile(
  employeeId: string,
  userId: string
): Promise<EmployeeProfileResult | null> {
  const [employee, user] = await Promise.all([
    Employee.findById(employeeId)
      .populate("department", "name")
      .populate("position", "name")
      .populate("manager", "firstName middleName lastName")
      .lean(),
    User.findById(userId).select("notification").lean(),
  ]);

  if (!employee) return null;

  const manager = employee.manager as
    | { firstName: string; middleName?: string; lastName: string }
    | undefined;
  const department = employee.department as { name?: string } | undefined;
  const position = employee.position as { name?: string } | undefined;
  const notification = user?.notification;

  return {
    employeeId: employee.employeeId,
    firstName: employee.firstName,
    middleName: employee.middleName,
    lastName: employee.lastName,
    fullName: nameOf(employee),
    email: employee.email,
    phone: employee.phone,
    birthDate: serialiseDate(employee.birthDate),
    gender: employee.gender,
    avatar: employee.avatar,
    address: employee.address,
    emergencyContact: employee.emergencyContact,
    department: department?.name ?? "Unassigned",
    position: position?.name ?? "Unassigned",
    manager: manager ? nameOf(manager) : "Not assigned",
    hireDate: serialiseDate(employee.hireDate),
    status: employee.employmentStatus,
    type: employee.employmentType,
    notification: {
      leave: notification?.leave ?? true,
      attendance: notification?.attendance ?? true,
      announcements: notification?.announcements ?? true,
      payroll: notification?.payroll ?? true,
      email: notification?.email ?? true,
    },
  };
}

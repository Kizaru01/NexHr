import "server-only";

import connectToDatabase from "@/database/mongodb";
import Department from "@/models/department.model";
import Employee from "@/models/employee.model";
import Position from "@/models/position.model";
import {
  DEFAULT_PAGE_SIZE,
  employeeSorts,
  nameOf,
  safePage,
  serialiseDate,
  setObjectIdFilter,
  type ListFilters,
  type SelectOption,
} from "./hr-dashboard.shared";

export async function getEmployeeFilters(): Promise<{
  departments: SelectOption[];
  positions: SelectOption[];
}> {
  await connectToDatabase();

  const [departments, positions] = await Promise.all([
    Department.find({ isActive: true }).select("name").sort({ name: 1 }).lean(),
    Position.find({ isActive: true }).select("name").sort({ name: 1 }).lean(),
  ]);

  return {
    departments: departments.map((department) => ({
      value: department._id.toString(),
      label: department.name,
    })),
    positions: positions.map((position) => ({
      value: position._id.toString(),
      label: position.name,
    })),
  };
}

export async function getEmployeeDirectory(filters: ListFilters) {
  await connectToDatabase();

  const page = safePage(filters.page);
  const query: Record<string, unknown> = {};
  const searchTerm = filters.search?.trim();

  setObjectIdFilter(query, "department", filters.department);
  setObjectIdFilter(query, "position", filters.position);

  if (filters.status) {
    query.employmentStatus = filters.status;
  }

  if (searchTerm) {
    query.$or = ["firstName", "lastName", "email", "employeeId"].map(
      (field) => ({ [field]: { $regex: searchTerm, $options: "i" } })
    );
  }

  const sort = employeeSorts[filters.sort ?? ""] ?? employeeSorts["recently-added"];
  const [employees, total] = await Promise.all([
    Employee.find(query)
      .populate("department", "name")
      .populate("position", "name")
      .populate("manager", "firstName lastName")
      .sort(sort)
      .skip((page - 1) * DEFAULT_PAGE_SIZE)
      .limit(DEFAULT_PAGE_SIZE)
      .lean(),
    Employee.countDocuments(query),
  ]);

  return {
    employees: employees.map((employee) => ({
      id: employee._id.toString(),
      employeeId: employee.employeeId,
      name: nameOf(employee),
      avatar: employee.avatar,
      department: (employee.department as { name?: string })?.name ?? "Unassigned",
      position: (employee.position as { name?: string })?.name ?? "Unassigned",
      status: employee.employmentStatus,
      type: employee.employmentType,
      hireDate: serialiseDate(employee.hireDate),
      email: employee.email,
      phone: employee.phone,
      manager: employee.manager
        ? nameOf(
            employee.manager as unknown as {
              firstName: string;
              middleName?: string;
              lastName: string;
            }
          )
        : "—",
    })),
    page,
    totalPages: Math.max(Math.ceil(total / DEFAULT_PAGE_SIZE), 1),
    total,
  };
}

export async function getEmployeeProfile(employeeId: string) {
  await connectToDatabase();

  const employee = await Employee.findOne({ employeeId })
    .populate("department", "name")
    .populate("position", "name")
    .populate("manager", "firstName middleName lastName")
    .lean();

  if (!employee) {
    return null;
  }

  return {
    employeeId: employee.employeeId,
    name: nameOf(employee),
    email: employee.email,
    phone: employee.phone,
    avatar: employee.avatar,
    gender: employee.gender,
    birthDate: serialiseDate(employee.birthDate),
    department: (employee.department as { name?: string })?.name ?? "Unassigned",
    position: (employee.position as { name?: string })?.name ?? "Unassigned",
    hireDate: serialiseDate(employee.hireDate),
    status: employee.employmentStatus,
    type: employee.employmentType,
    manager: employee.manager
      ? nameOf(
          employee.manager as unknown as {
            firstName: string;
            middleName?: string;
            lastName: string;
          }
        )
      : "—",
    address: employee.address,
    emergencyContact: employee.emergencyContact,
    createdAt: serialiseDate(employee.createdAt),
    updatedAt: serialiseDate(employee.updatedAt),
    notes: employee.notes,
  };
}

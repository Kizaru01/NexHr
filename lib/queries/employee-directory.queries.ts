import "server-only";

import connectToDatabase from "@/database/mongodb";
import Department from "@/models/department.model";
import Employee from "@/models/employee.model";
import Position from "@/models/position.model";
import type {
  EmployeeDirectoryResult,
  EmployeeFilterOptions,
  EmployeeProfileResult,
} from "@/types/hr-dashboard";
import {
  DEFAULT_PAGE_SIZE,
  employeeSorts,
  nameOf,
  safePage,
  serialiseDate,
  setObjectIdFilter,
  type ListFilters,
} from "./hr-dashboard.shared";

export async function getEmployeeFilters(): Promise<EmployeeFilterOptions> {
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

export async function getEmployeeDirectory(
  filters: ListFilters
): Promise<EmployeeDirectoryResult> {
  const {
    department,
    page: pageFilter,
    position,
    search,
    sort: sortFilter,
    status,
  } = filters;

  await connectToDatabase();

  const page = safePage(pageFilter);
  const query: Record<string, unknown> = {};
  const searchTerm = search?.trim();

  setObjectIdFilter(query, "department", department);
  setObjectIdFilter(query, "position", position);

  if (status) {
    query.employmentStatus = status;
  }

  if (searchTerm) {
    query.$or = ["firstName", "lastName", "email", "employeeId"].map(
      (field) => ({ [field]: { $regex: searchTerm, $options: "i" } })
    );
  }

  const sort = employeeSorts[sortFilter ?? ""] ?? employeeSorts["recently-added"];
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
    employees: employees.map((employee) => {
      const {
        _id,
        avatar,
        department,
        email,
        employeeId,
        employmentStatus,
        employmentType,
        hireDate,
        manager,
        phone,
        position,
      } = employee;
      const departmentName =
        (department as { name?: string })?.name ?? "Unassigned";
      const positionName =
        (position as { name?: string })?.name ?? "Unassigned";
      const managerName = manager
        ? nameOf(
            manager as unknown as {
              firstName: string;
              middleName?: string;
              lastName: string;
            }
          )
        : "—";

      return {
        id: _id.toString(),
        employeeId,
        name: nameOf(employee),
        avatar,
        department: departmentName,
        position: positionName,
        status: employmentStatus,
        type: employmentType,
        hireDate: serialiseDate(hireDate),
        email,
        phone,
        manager: managerName,
      };
    }),
    page,
    totalPages: Math.max(Math.ceil(total / DEFAULT_PAGE_SIZE), 1),
    total,
  };
}

export async function getEmployeeProfile(
  employeeId: string
): Promise<EmployeeProfileResult | null> {
  await connectToDatabase();

  const employee = await Employee.findOne({ employeeId })
    .populate("department", "name")
    .populate("position", "name")
    .populate("manager", "firstName middleName lastName")
    .lean();

  if (!employee) {
    return null;
  }

  const {
    address,
    avatar,
    birthDate,
    createdAt,
    department,
    email,
    emergencyContact,
    employeeId: resolvedEmployeeId,
    employmentStatus,
    employmentType,
    gender,
    hireDate,
    manager,
    notes,
    phone,
    position,
    updatedAt,
  } = employee;

  return {
    employeeId: resolvedEmployeeId,
    name: nameOf(employee),
    email,
    phone,
    avatar,
    gender,
    birthDate: serialiseDate(birthDate),
    department: (department as { name?: string })?.name ?? "Unassigned",
    position: (position as { name?: string })?.name ?? "Unassigned",
    hireDate: serialiseDate(hireDate),
    status: employmentStatus,
    type: employmentType,
    manager: manager
      ? nameOf(
          manager as unknown as {
            firstName: string;
            middleName?: string;
            lastName: string;
          }
        )
      : "—",
    address,
    emergencyContact,
    createdAt: serialiseDate(createdAt),
    updatedAt: serialiseDate(updatedAt),
    notes,
  };
}

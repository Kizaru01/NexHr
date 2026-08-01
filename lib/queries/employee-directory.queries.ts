import "server-only";

import connectToDatabase from "@/database/mongodb";
import {
  findUserIdsByEmailSearch,
  getUserEmail,
  hasFailedWelcomeEmail,
} from "@/lib/handler/user.helper";
import Department from "@/models/department.model";
import Employee from "@/models/employee.model";
import EmployeeProfileNote from "@/models/employee-profile-note.model";
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
    const matchingUserIds = await findUserIdsByEmailSearch(searchTerm);
    query.$or = ["firstName", "lastName", "employeeId"].map((field) => ({
      [field]: { $regex: searchTerm, $options: "i" },
    }));
    (query.$or as Array<Record<string, unknown>>).push({
      userId: { $in: matchingUserIds },
    });
  }

  const sort =
    employeeSorts[sortFilter ?? ""] ?? employeeSorts["recently-added"];
  const [employees, total] = await Promise.all([
    Employee.find(query)
      .populate("userId", "email isActive welcomeEmailStatus")
      .populate({
        path: "department",
        select: "name manager",
        populate: {
          path: "manager",
          select: "firstName middleName lastName",
        },
      })
      .populate("position", "name")
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
        employeeId,
        employmentStatus,
        employmentType,
        hireDate,
        phone,
        position,
        userId,
      } = employee;
      const populatedDepartment = department as
        | {
            name?: string;
            manager?: {
              firstName?: string;
              middleName?: string;
              lastName?: string;
            };
          }
        | undefined;
      const departmentName = populatedDepartment?.name ?? "Unassigned";
      const positionName =
        (position as { name?: string })?.name ?? "Unassigned";
      const managerName = populatedDepartment?.manager
        ? nameOf(
            populatedDepartment.manager as {
              firstName?: string;
              middleName?: string;
              lastName?: string;
            }
          )
        : "—";

      return {
        id: _id.toString(),
        employeeId,
        name: nameOf(employee) || getUserEmail(userId),
        avatar,
        department: departmentName,
        position: positionName,
        status: employmentStatus,
        type: employmentType,
        hireDate: serialiseDate(hireDate),
        email: getUserEmail(userId),
        phone,
        manager: managerName,
        welcomeEmailFailed: hasFailedWelcomeEmail(userId),
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
    .populate("userId", "email isActive welcomeEmailStatus")
    .populate({
      path: "department",
      select: "name manager",
      populate: {
        path: "manager",
        select: "firstName middleName lastName",
      },
    })
    .populate("position", "name")
    .lean();

  if (!employee) {
    return null;
  }

  const noteQueryTime = new Date();
  const temporaryNotes = await EmployeeProfileNote.find({
    employee: employee._id,
    expiresAt: { $gt: noteQueryTime },
  })
    .populate("author", "email")
    .sort({ createdAt: -1 })
    .lean();

  const {
    address,
    avatar,
    birthDate,
    createdAt,
    department,
    emergencyContact,
    employeeId: resolvedEmployeeId,
    employmentStatus,
    employmentType,
    gender,
    hireDate,
    notes,
    phone,
    position,
    profileCompleted,
    updatedAt,
    userId,
  } = employee;
  const accountActive =
    typeof userId === "object" &&
    userId !== null &&
    "isActive" in userId &&
    userId.isActive === true;

  const populatedDepartment = department as
    | {
        name?: string;
        manager?: {
          firstName?: string;
          middleName?: string;
          lastName?: string;
        };
      }
    | undefined;

  return {
    employeeId: resolvedEmployeeId,
    name: nameOf(employee) || getUserEmail(userId),
    email: getUserEmail(userId),
    phone,
    avatar,
    gender,
    birthDate: serialiseDate(birthDate),
    department: populatedDepartment?.name ?? "Unassigned",
    position: (position as { name?: string })?.name ?? "Unassigned",
    hireDate: serialiseDate(hireDate),
    status: employmentStatus,
    type: employmentType,
    manager: populatedDepartment?.manager
      ? nameOf(
          populatedDepartment.manager as {
            firstName?: string;
            middleName?: string;
            lastName?: string;
          }
        )
      : "—",
    address,
    emergencyContact,
    createdAt: serialiseDate(createdAt),
    updatedAt: serialiseDate(updatedAt),
    notes,
    accountActive,
    profileCompleted,
    welcomeEmailFailed: hasFailedWelcomeEmail(userId),
    temporaryNotes: temporaryNotes.map((note) => ({
      id: note._id.toString(),
      author:
        (note.author as unknown as { email?: string })?.email ?? "HR team",
      body: note.body,
      createdAt: serialiseDate(note.createdAt),
      expiresAt: serialiseDate(note.expiresAt),
      remainingDays: Math.max(
        1,
        Math.ceil(
          (note.expiresAt.getTime() - noteQueryTime.getTime()) /
            (24 * 60 * 60 * 1_000)
        )
      ),
    })),
  };
}

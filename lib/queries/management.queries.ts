import "server-only";

import { Types } from "mongoose";

import connectToDatabase from "@/database/mongodb";
import Department from "@/models/department.model";
import Employee from "@/models/employee.model";
import Position from "@/models/position.model";
import type { FilterValues } from "@/types/filters";
import type { SortDefinition } from "@/types/hr-dashboard";
import type {
  DepartmentListItem,
  DepartmentManagerOption,
  PositionDirectoryResult,
} from "@/types/management";

const departmentSorts: Record<string, SortDefinition> = {
  "created-desc": { createdAt: -1 },
  "name-asc": { name: 1 },
  "name-desc": { name: -1 },
  "updated-desc": { updatedAt: -1 },
};

const positionSorts: Record<string, SortDefinition> = {
  "created-desc": { createdAt: -1 },
  "name-asc": { name: 1 },
  "name-desc": { name: -1 },
  "updated-desc": { updatedAt: -1 },
};

function getManagementStatus(status?: string): boolean | undefined {
  if (status === "active") {
    return true;
  }

  if (status === "archived") {
    return false;
  }

  return undefined;
}

function getSearchExpression(search?: string): RegExp | undefined {
  const searchTerm = search?.trim();

  return searchTerm ? new RegExp(searchTerm, "i") : undefined;
}

export async function getDepartmentDirectory(
  filters: FilterValues
): Promise<DepartmentListItem[]> {
  await connectToDatabase();

  const query: Record<string, unknown> = {};
  const searchExpression = getSearchExpression(filters.search);
  const isActive = getManagementStatus(filters.status);

  if (searchExpression) {
    query.$or = [
      { name: searchExpression },
      { code: searchExpression },
      { description: searchExpression },
    ];
  }

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  const sort =
    departmentSorts[filters.sort ?? ""] ?? departmentSorts["name-asc"];
  const departments = await Department.find(query)
    .select("_id name code description manager isActive createdAt updatedAt")
    .populate("manager", "firstName middleName lastName")
    .sort(sort)
    .lean();

  return departments.map((department) => {
    const manager = department.manager as unknown as
      | {
          _id: { toString(): string };
          firstName?: string;
          middleName?: string;
          lastName?: string;
        }
      | undefined;
    const managerName = manager
      ? [manager.firstName, manager.middleName, manager.lastName]
          .filter(Boolean)
          .join(" ")
      : undefined;

    return {
      id: department._id.toString(),
      name: department.name,
      code: department.code,
      description: department.description,
      managerId: manager?._id.toString(),
      managerName: managerName || undefined,
      isActive: department.isActive,
      createdAt: department.createdAt.toISOString(),
      updatedAt: department.updatedAt.toISOString(),
    };
  });
}

export async function getDepartmentManagerOptions(): Promise<
  DepartmentManagerOption[]
> {
  await connectToDatabase();

  const employees = await Employee.find({
    employmentStatus: "Active",
    profileCompleted: true,
  })
    .select("_id employeeId firstName middleName lastName department")
    .sort({ firstName: 1, lastName: 1 })
    .lean();

  return employees.map((employee) => ({
    id: employee._id.toString(),
    name:
      [employee.firstName, employee.middleName, employee.lastName]
        .filter(Boolean)
        .join(" ") || employee.employeeId,
    departmentId: employee.department.toString(),
  }));
}

export async function getPositionDirectory(
  filters: FilterValues
): Promise<PositionDirectoryResult> {
  const { department, search, sort: sortFilter, status } = filters;

  await connectToDatabase();

  const searchExpression = getSearchExpression(search);
  const isActive = getManagementStatus(status);
  const [departments, matchingDepartmentIds] = await Promise.all([
    Department.find({}).select("_id name isActive").sort({ name: 1 }).lean(),
    searchExpression
      ? Department.find({ name: searchExpression }).distinct("_id")
      : Promise.resolve([]),
  ]);
  const query: Record<string, unknown> = {};

  if (department) {
    query.department = Types.ObjectId.isValid(department)
      ? department
      : { $in: [] };
  }

  if (isActive !== undefined) {
    query.isActive = isActive;
  }

  if (searchExpression) {
    query.$or = [
      { name: searchExpression },
      { description: searchExpression },
      { department: { $in: matchingDepartmentIds } },
    ];
  }

  const sort = positionSorts[sortFilter ?? ""] ?? positionSorts["name-asc"];
  const positions = await Position.find(query)
    .select(
      "_id name department description salary isActive createdAt updatedAt"
    )
    .sort(sort)
    .lean();
  const departmentsById = new Map(
    departments.map((department) => [department._id.toString(), department])
  );

  return {
    departments: departments.map((department) => ({
      id: department._id.toString(),
      name: department.name,
      isActive: department.isActive,
    })),
    positions: positions.map((position) => {
      const department = departmentsById.get(position.department.toString());

      return {
        id: position._id.toString(),
        name: position.name,
        departmentId: position.department.toString(),
        departmentName: department?.name ?? "Deleted department",
        departmentIsActive: department?.isActive ?? false,
        description: position.description,
        salary: {
          basic: position.salary.basic,
          allowance: position.salary.allowance,
        },
        isActive: position.isActive,
        createdAt: position.createdAt.toISOString(),
        updatedAt: position.updatedAt.toISOString(),
      };
    }),
  };
}

import "server-only";

import { Types } from "mongoose";

import connectToDatabase from "@/database/mongodb";
import Department from "@/models/department.model";
import Position from "@/models/position.model";
import type { FilterValues } from "@/types/filters";
import type { SortDefinition } from "@/types/hr-dashboard";
import type {
  DepartmentListItem,
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

export async function getDepartmentDirectory(filters: FilterValues): Promise<
  DepartmentListItem[]
> {
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

  const sort = departmentSorts[filters.sort ?? ""] ?? departmentSorts["name-asc"];
  const departments = await Department.find(query)
    .select("_id name code description isActive createdAt updatedAt")
    .sort(sort)
    .lean();

  return departments.map((department) => ({
    id: department._id.toString(),
    name: department.name,
    code: department.code,
    description: department.description,
    isActive: department.isActive,
    createdAt: department.createdAt.toISOString(),
    updatedAt: department.updatedAt.toISOString(),
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
    Department.find({})
      .select("_id name isActive")
      .sort({ name: 1 })
      .lean(),
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
    .select("_id name department description isActive createdAt updatedAt")
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
        isActive: position.isActive,
        createdAt: position.createdAt.toISOString(),
        updatedAt: position.updatedAt.toISOString(),
      };
    }),
  };
}

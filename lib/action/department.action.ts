"use server";

import { revalidatePath } from "next/cache";

import Department from "@/models/department.model";
import Employee from "@/models/employee.model";
import Position from "@/models/position.model";
import type { ActionResponse, ErrorResponse } from "@/types/global";
import type { DepartmentListItem } from "@/types/management";
import {
  createDepartmentSchema,
  deleteDepartmentSchema,
  setDepartmentStatusSchema,
  type CreateDepartmentInput,
  type UpdateDepartmentInput,
  updateDepartmentSchema,
} from "@/validations/department.schema";
import action from "../handler/action-helper";
import handleError from "../handler/error";
import { ConflictError, NotFoundError } from "../http-errors";

const DEPARTMENTS_PATH = "/departments";
const POSITIONS_PATH = "/positions";
const NEW_EMPLOYEE_PATH = "/employees/new";

function revalidateDepartmentViews(): void {
  revalidatePath(DEPARTMENTS_PATH);
  revalidatePath(POSITIONS_PATH);
  revalidatePath(NEW_EMPLOYEE_PATH);
  revalidatePath("/employees");
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === 11000
  );
}

function normalizeName(name: string): string {
  return name.trim().toLocaleLowerCase("en-US");
}

async function assertDepartmentNameIsUnique(
  name: string,
  excludeId?: string
): Promise<void> {
  const existing = await Department.exists({
    nameKey: normalizeName(name),
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });

  if (existing) {
    throw new ConflictError(`Department name \"${name}\" is already in use.`);
  }
}

async function assertDepartmentCodeIsUnique(
  code: string | undefined,
  excludeId?: string
): Promise<void> {
  if (!code) return;

  const existing = await Department.exists({
    code,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });

  if (existing) {
    throw new ConflictError(`Department code \"${code}\" is already in use.`);
  }
}

function toDepartmentListItem(department: {
  _id: { toString(): string };
  name: string;
  code?: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): DepartmentListItem {
  return {
    id: department._id.toString(),
    name: department.name,
    code: department.code,
    description: department.description,
    isActive: department.isActive,
    createdAt: department.createdAt.toISOString(),
    updatedAt: department.updatedAt.toISOString(),
  };
}

export async function createDepartment(
  params: CreateDepartmentInput
): Promise<ActionResponse> {
  try {
    const validationResult = await action({
      params,
      schema: createDepartmentSchema,
      roles: ["admin", "hr"],
    });
    const departmentParams = validationResult.params!;

    await assertDepartmentNameIsUnique(departmentParams.name);
    await assertDepartmentCodeIsUnique(departmentParams.code);
    await Department.create(departmentParams);

    revalidateDepartmentViews();

    return { success: true };
  } catch (error) {
    return handleError(
      isDuplicateKeyError(error)
        ? new ConflictError(
            "A department with that name or code already exists."
          )
        : error
    ) as ErrorResponse;
  }
}

export async function updateDepartment(
  params: UpdateDepartmentInput
): Promise<ActionResponse<DepartmentListItem>> {
  try {
    const validationResult = await action({
      params,
      schema: updateDepartmentSchema,
      roles: ["admin", "hr"],
    });
    const { id, ...departmentParams } = validationResult.params!;

    const department = await Department.findById(id);
    if (!department) throw new NotFoundError("Department");

    await assertDepartmentNameIsUnique(departmentParams.name, id);
    await assertDepartmentCodeIsUnique(departmentParams.code, id);

    department.name = departmentParams.name;
    department.code = departmentParams.code;
    department.description = departmentParams.description;
    await department.save();

    revalidateDepartmentViews();
    return { success: true, data: toDepartmentListItem(department) };
  } catch (error) {
    return handleError(
      isDuplicateKeyError(error)
        ? new ConflictError(
            "A department with that name or code already exists."
          )
        : error
    ) as ErrorResponse;
  }
}

export async function setDepartmentStatus(params: {
  id: string;
  isActive: boolean;
}): Promise<ActionResponse<DepartmentListItem>> {
  try {
    const validationResult = await action({
      params,
      schema: setDepartmentStatusSchema,
      roles: ["admin", "hr"],
    });
    const { id, isActive } = validationResult.params!;

    const department = await Department.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );
    if (!department) throw new NotFoundError("Department");

    revalidateDepartmentViews();
    return { success: true, data: toDepartmentListItem(department) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteDepartment(params: {
  id: string;
}): Promise<ActionResponse<null>> {
  try {
    const validationResult = await action({
      params,
      schema: deleteDepartmentSchema,
      roles: ["admin", "hr"],
    });
    const { id } = validationResult.params!;

    const department = await Department.findById(id).select("_id");
    if (!department) throw new NotFoundError("Department");

    const [hasPositions, hasEmployees] = await Promise.all([
      Position.exists({ department: id }),
      Employee.exists({ department: id }),
    ]);

    if (hasPositions || hasEmployees) {
      throw new ConflictError(
        "This department is still referenced. Archive it instead of deleting it."
      );
    }

    await Department.deleteOne({ _id: id });
    revalidateDepartmentViews();

    return { success: true, data: null };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

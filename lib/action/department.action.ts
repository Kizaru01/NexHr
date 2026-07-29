"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

import { formatPersonName } from "@/lib/person-name";
import Department from "@/models/department.model";
import Employee from "@/models/employee.model";
import Position from "@/models/position.model";
import type { ActionResponse } from "@/types/global";
import type {
  DepartmentListItem,
  DepartmentListSource,
} from "@/types/management";
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
import {
  ConflictError,
  NotFoundError,
  isDuplicateKeyError,
} from "../http-errors";

const DEPARTMENTS_PATH = "/departments";
const POSITIONS_PATH = "/positions";
const NEW_EMPLOYEE_PATH = "/employees/new";

function revalidateDepartmentViews(): void {
  revalidatePath(DEPARTMENTS_PATH);
  revalidatePath(POSITIONS_PATH);
  revalidatePath(NEW_EMPLOYEE_PATH);
  revalidatePath("/employees");
  revalidatePath("/employee");
  revalidatePath("/employee/profile");
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

async function assertDepartmentManager(
  managerId: string | undefined,
  departmentId: string
): Promise<void> {
  if (!managerId) return;

  const manager = await Employee.exists({
    _id: managerId,
    department: departmentId,
    employmentStatus: "Active",
    profileCompleted: true,
  });

  if (!manager) {
    throw new ConflictError(
      "The department manager must be an active employee in this department."
    );
  }
}

function toDepartmentListItem(
  department: DepartmentListSource
): DepartmentListItem {
  const {
    _id,
    code,
    createdAt,
    description,
    isActive,
    manager,
    name,
    updatedAt,
  } = department;

  const populatedManager =
    typeof manager === "object" &&
    manager !== null &&
    "_id" in manager &&
    ("firstName" in manager || "lastName" in manager)
      ? (manager as {
          _id: { toString(): string };
          firstName?: string;
          middleName?: string;
          lastName?: string;
        })
      : undefined;
  const managerId = populatedManager
    ? populatedManager._id.toString()
    : manager &&
        typeof manager === "object" &&
        "toString" in manager
      ? manager.toString()
      : undefined;

  return {
    id: _id.toString(),
    name,
    code,
    description,
    managerId,
    managerName: populatedManager
      ? formatPersonName(populatedManager)
      : undefined,
    isActive,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
  };
}

export async function createDepartment(
  params: CreateDepartmentInput
): Promise<ActionResponse<null>> {
  try {
    const validationResult = await action({
      params,
      schema: createDepartmentSchema,
      roles: ["admin", "hr"],
    });
    const departmentParams = validationResult.params!;
    const { code, manager, name } = departmentParams;

    await assertDepartmentNameIsUnique(name);
    await assertDepartmentCodeIsUnique(code);
    const department = new Department(departmentParams);
    await assertDepartmentManager(manager, department._id.toString());
    await department.save();

    revalidateDepartmentViews();

    return { success: true, data: null };
  } catch (error) {
    return handleError(
      isDuplicateKeyError(error)
        ? new ConflictError(
            "A department with that name or code already exists."
          )
        : error
    );
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
    const { code, description, manager, name } = departmentParams;

    const department = await Department.findById(id);
    if (!department) throw new NotFoundError("Department");

    await assertDepartmentNameIsUnique(name, id);
    await assertDepartmentCodeIsUnique(code, id);
    await assertDepartmentManager(manager, id);

    department.name = name;
    department.code = code;
    department.description = description;
    department.manager = manager ? new Types.ObjectId(manager) : undefined;
    await department.save();
    await department.populate("manager", "firstName middleName lastName");

    revalidateDepartmentViews();
    return { success: true, data: toDepartmentListItem(department) };
  } catch (error) {
    return handleError(
      isDuplicateKeyError(error)
        ? new ConflictError(
            "A department with that name or code already exists."
          )
        : error
    );
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
    return handleError(error);
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
    return handleError(error);
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

import Department from "@/models/department.model";
import Employee from "@/models/employee.model";
import Position from "@/models/position.model";
import type { ActionResponse, ErrorResponse } from "@/types/global";
import type { PositionListItem } from "@/types/management";
import {
  createPositionSchema,
  deletePositionSchema,
  setPositionStatusSchema,
  type CreatePositionInput,
  type UpdatePositionInput,
  updatePositionSchema,
} from "@/validations/position.schema";
import action from "../handler/action-helper";
import handleError from "../handler/error";
import { ConflictError, NotFoundError } from "../http-errors";

const POSITIONS_PATH = "/positions";
const NEW_EMPLOYEE_PATH = "/employees/new";

function revalidatePositionViews(): void {
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

async function assertDepartmentIsActive(departmentId: string): Promise<void> {
  const department = await Department.exists({
    _id: departmentId,
    isActive: true,
  });

  if (!department) {
    throw new NotFoundError("Active department");
  }
}

async function assertPositionNameIsUnique(
  name: string,
  department: string,
  excludeId?: string
): Promise<void> {
  const existing = await Position.exists({
    nameKey: normalizeName(name),
    department,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
  });

  if (existing) {
    throw new ConflictError(
      `Position name \"${name}\" is already in use in this department.`
    );
  }
}

function toPositionListItem(position: {
  _id: { toString(): string };
  name: string;
  department: { toString(): string };
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}): PositionListItem {
  return {
    id: position._id.toString(),
    name: position.name,
    departmentId: position.department.toString(),
    departmentName: "",
    departmentIsActive: true,
    description: position.description,
    isActive: position.isActive,
    createdAt: position.createdAt.toISOString(),
    updatedAt: position.updatedAt.toISOString(),
  };
}

export async function createPosition(
  params: CreatePositionInput
): Promise<ActionResponse<PositionListItem>> {
  try {
    const validationResult = await action({
      params,
      schema: createPositionSchema,
      roles: ["admin", "hr"],
    });
    const positionParams = validationResult.params!;

    await assertDepartmentIsActive(positionParams.department);
    await assertPositionNameIsUnique(
      positionParams.name,
      positionParams.department
    );

    const position = await Position.create(positionParams);
    revalidatePositionViews();

    return { success: true, data: toPositionListItem(position) };
  } catch (error) {
    return handleError(
      isDuplicateKeyError(error)
        ? new ConflictError(
            "A position with that name already exists in this department."
          )
        : error
    ) as ErrorResponse;
  }
}

export async function updatePosition(
  params: UpdatePositionInput
): Promise<ActionResponse<PositionListItem>> {
  try {
    const validationResult = await action({
      params,
      schema: updatePositionSchema,
      roles: ["admin", "hr"],
    });
    const { id, ...positionParams } = validationResult.params!;

    const position = await Position.findById(id);
    if (!position) throw new NotFoundError("Position");

    const departmentChanged =
      position.department.toString() !== positionParams.department;

    if (departmentChanged) {
      await assertDepartmentIsActive(positionParams.department);

      const hasEmployees = await Employee.exists({ position: id });
      if (hasEmployees) {
        throw new ConflictError(
          "A position assigned to employees cannot be moved to another department."
        );
      }
    }

    await assertPositionNameIsUnique(
      positionParams.name,
      positionParams.department,
      id
    );

    position.name = positionParams.name;
    position.department = new Types.ObjectId(positionParams.department);
    position.description = positionParams.description;
    await position.save();

    revalidatePositionViews();
    return { success: true, data: toPositionListItem(position) };
  } catch (error) {
    return handleError(
      isDuplicateKeyError(error)
        ? new ConflictError(
            "A position with that name already exists in this department."
          )
        : error
    ) as ErrorResponse;
  }
}

export async function setPositionStatus(params: {
  id: string;
  isActive: boolean;
}): Promise<ActionResponse> {
  try {
    const validationResult = await action({
      params,
      schema: setPositionStatusSchema,
      roles: ["admin", "hr"],
    });
    const { id, isActive } = validationResult.params!;

    const position = await Position.findByIdAndUpdate(
      id,
      { isActive },
      { new: true, runValidators: true }
    );
    if (!position) throw new NotFoundError("Position");

    revalidatePositionViews();

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deletePosition(params: {
  id: string;
}): Promise<ActionResponse> {
  try {
    const validationResult = await action({
      params,
      schema: deletePositionSchema,
      roles: ["admin", "hr"],
    });
    const { id } = validationResult.params!;

    const position = await Position.findById(id).select("_id");
    if (!position) throw new NotFoundError("Position");

    const hasEmployees = await Employee.exists({ position: id });
    if (hasEmployees) {
      throw new ConflictError(
        "This position is still assigned to employees. Archive it instead of deleting it."
      );
    }

    await Position.deleteOne({ _id: id });
    revalidatePositionViews();

    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

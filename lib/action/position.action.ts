"use server";

import { revalidatePath } from "next/cache";
import { Types } from "mongoose";

import Department from "@/models/department.model";
import Employee from "@/models/employee.model";
import Position from "@/models/position.model";
import type { ActionResponse } from "@/types/global";
import type {
  PositionListItem,
  PositionListSource,
} from "@/types/management";
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
import {
  ConflictError,
  NotFoundError,
  isDuplicateKeyError,
} from "../http-errors";

const POSITIONS_PATH = "/positions";
const NEW_EMPLOYEE_PATH = "/employees/new";

function revalidatePositionViews(): void {
  revalidatePath(POSITIONS_PATH);
  revalidatePath(NEW_EMPLOYEE_PATH);
  revalidatePath("/employees");
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

function toPositionListItem(position: PositionListSource): PositionListItem {
  const {
    _id,
    createdAt,
    department,
    description,
    isActive,
    name,
    updatedAt,
  } = position;

  return {
    id: _id.toString(),
    name,
    departmentId: department.toString(),
    departmentName: "",
    departmentIsActive: true,
    description,
    isActive,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
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
    const { department, name } = positionParams;

    await assertDepartmentIsActive(department);
    await assertPositionNameIsUnique(name, department);

    const position = await Position.create(positionParams);
    const listPosition = toPositionListItem(position);
    revalidatePositionViews();

    return { success: true, data: listPosition };
  } catch (error) {
    return handleError(
      isDuplicateKeyError(error)
        ? new ConflictError(
            "A position with that name already exists in this department."
          )
        : error
    );
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
    const { department, description, name } = positionParams;

    const position = await Position.findById(id);

    if (!position) throw new NotFoundError("Position");

    const departmentChanged =
      position.department.toString() !== department;

    if (departmentChanged) {
      await assertDepartmentIsActive(department);

      const hasEmployees = await Employee.exists({ position: id });
      if (hasEmployees) {
        throw new ConflictError(
          "A position assigned to employees cannot be moved to another department."
        );
      }
    }

    await assertPositionNameIsUnique(name, department, id);

    position.name = name;
    position.department = new Types.ObjectId(department);
    position.description = description;
    await position.save();

    const listPosition = toPositionListItem(position);

    revalidatePositionViews();
    return { success: true, data: listPosition };
  } catch (error) {
    return handleError(
      isDuplicateKeyError(error)
        ? new ConflictError(
            "A position with that name already exists in this department."
          )
        : error
    );
  }
}

export async function setPositionStatus(params: {
  id: string;
  isActive: boolean;
}): Promise<ActionResponse<null>> {
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

    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

export async function deletePosition(params: {
  id: string;
}): Promise<ActionResponse<null>> {
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

    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

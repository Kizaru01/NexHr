"use server";

import { revalidatePath } from "next/cache";

import Employee from "@/models/employee.model";
import type {
  ActionResponse,
  EmployeeDetail,
  UpdateAddressParams,
  UpdateEmergencyContactParams,
  UpdateEmployeeInput,
  UpdateEmploymentInformationParams,
  UpdatePersonalInformationParams,
} from "@/types/global";
import {
  updateAddressSchema,
  updateEmergencyContactSchema,
  updateEmployeeSchema,
  updateEmploymentInformationSchema,
  updatePersonalInformationSchema,
} from "@/validations/employee.schema";
import {
  findEmployeeDetailOrThrow,
  toEmployeeDetail,
} from "../../handler/employee.helper";
import { updateEmployeeAndUserProfile } from "../../handler/employee-profile.helper";
import action from "../../handler/action-helper";
import handleError from "../../handler/error";
import { getUserId } from "../../handler/user.helper";
import { ForbiddenError } from "../../http-errors";

const EMPLOYEES_PATH = "/employees";

function assertEmployeeOwnsProfile(
  session: { user: { id?: string; role?: string } },
  employee: { userId: unknown }
): void {
  if (
    session.user.role === "employee" &&
    getUserId(employee.userId) !== session.user.id
  ) {
    throw new ForbiddenError("You can only update your own employee profile.");
  }
}

function revalidateEmployee(employeeId: string): void {
  revalidatePath(EMPLOYEES_PATH);
  revalidatePath(`${EMPLOYEES_PATH}/${employeeId}`);
}

export async function updateEmployee(
  params: UpdateEmployeeInput
): Promise<ActionResponse<EmployeeDetail>> {
  try {
    const validationResult = await action({
      params,
      schema: updateEmployeeSchema,
      roles: ["admin", "hr"],
    });

    const { employeeId, email, ...rest } = validationResult.params!;

    const employee = await findEmployeeDetailOrThrow(employeeId);

    if (email) {
      await updateEmployeeAndUserProfile({
        employeeDatabaseId: employee._id.toString(),
        userId: getUserId(employee.userId),
        email,
        employeeUpdates: rest,
      });
    } else {
      await Employee.updateOne(
        { _id: employee._id },
        { $set: rest },
        { runValidators: true }
      );
    }

    const updated = await findEmployeeDetailOrThrow(employeeId);

    if (!updated) throw new Error("Failed to update employee");

    revalidateEmployee(employeeId);

    const employeeUpdatedData = toEmployeeDetail(updated);

    return {
      success: true,
      data: employeeUpdatedData,
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateEmployeeProfile(
  params: UpdatePersonalInformationParams
): Promise<ActionResponse<EmployeeDetail>> {
  try {
    const validationResult = await action({
      params,
      schema: updatePersonalInformationSchema,
      roles: ["admin", "hr", "employee"],
    });

    const { employeeId, email, ...rest } = validationResult.params!;

    const employee = await findEmployeeDetailOrThrow(employeeId);
    assertEmployeeOwnsProfile(validationResult.session, employee);
    await updateEmployeeAndUserProfile({
      employeeDatabaseId: employee._id.toString(),
      userId: getUserId(employee.userId),
      email,
      employeeUpdates: rest,
    });

    const updated = await findEmployeeDetailOrThrow(employeeId);

    if (!updated) throw new Error("Failed to update employee profile");

    revalidateEmployee(employeeId);

    return { success: true, data: toEmployeeDetail(updated) };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateEmploymentInformation(
  params: UpdateEmploymentInformationParams
): Promise<ActionResponse<EmployeeDetail>> {
  try {
    const validationResult = await action({
      params,
      schema: updateEmploymentInformationSchema,
      roles: ["admin", "hr"],
    });

    const { employeeId, ...rest } = validationResult.params!;

    await findEmployeeDetailOrThrow(employeeId);

    const updated = await Employee.findOneAndUpdate(
      { employeeId },
      { ...rest },
      { new: true, runValidators: true }
    )
      .populate("userId", "email isActive")
      .populate("department")
      .populate("position");

    if (!updated) throw new Error("Failed to update employment information");

    revalidateEmployee(employeeId);

    return { success: true, data: toEmployeeDetail(updated) };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateEmergencyContact(
  params: UpdateEmergencyContactParams
): Promise<ActionResponse<EmployeeDetail>> {
  try {
    const validationResult = await action({
      params,
      schema: updateEmergencyContactSchema,
      roles: ["admin", "hr", "employee"],
    });

    const { employeeId, emergencyContact } = validationResult.params!;

    const employee = await findEmployeeDetailOrThrow(employeeId);
    assertEmployeeOwnsProfile(validationResult.session, employee);

    const updated = await Employee.findOneAndUpdate(
      { employeeId },
      { emergencyContact },
      { new: true, runValidators: true }
    )
      .populate("userId", "email isActive")
      .populate("department")
      .populate("position");

    if (!updated) throw new Error("Failed to update emergency contact");

    revalidateEmployee(employeeId);

    return { success: true, data: toEmployeeDetail(updated) };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateAddress(
  params: UpdateAddressParams
): Promise<ActionResponse<EmployeeDetail>> {
  try {
    const validationResult = await action({
      params,
      schema: updateAddressSchema,
      roles: ["admin", "hr", "employee"],
    });

    const { employeeId, address } = validationResult.params!;

    const employee = await findEmployeeDetailOrThrow(employeeId);
    assertEmployeeOwnsProfile(validationResult.session, employee);

    const updated = await Employee.findOneAndUpdate(
      { employeeId },
      { address },
      { new: true, runValidators: true }
    )
      .populate("userId", "email isActive")
      .populate("department")
      .populate("position");

    if (!updated) throw new Error("Failed to update address");

    revalidateEmployee(employeeId);

    return { success: true, data: toEmployeeDetail(updated) };
  } catch (error) {
    return handleError(error);
  }
}

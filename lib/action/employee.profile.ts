"use server";

import { revalidatePath } from "next/cache";

import {
  ActionResponse,
  EmployeeDetail,
  ErrorResponse,
  UpdateAddressParams,
  UpdateEmergencyContactParams,
  UpdateEmployeeInput,
  UpdateEmploymentInformationParams,
  UpdatePersonalInformationParams,
} from "@/types/global";
import {
  updateEmployeeSchema,
  updatePersonalInformationSchema,
  updateEmploymentInformationSchema,
  updateEmergencyContactSchema,
  updateAddressSchema,
} from "@/validations/employee.schema";
import {
  assertEmailIsUnique,
  findEmployeeDetailOrThrow,
  toEmployeeDetail,
} from "../handler/employee.helper";
import Employee from "@/models/employee.model";
import action from "../handler/action-helper";
import handleError from "../handler/error";

const EMPLOYEES_PATH = "/employees";

function revalidateEmployee(employeeId: string): void {
  revalidatePath(EMPLOYEES_PATH);
  revalidatePath(`${EMPLOYEES_PATH}/${employeeId}`);
}

/** Full-record update — accepts a partial payload, employeeId is required to locate the record. */
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

    await findEmployeeDetailOrThrow(employeeId);

    if (email) await assertEmailIsUnique(email, employeeId);

    const updated = await Employee.findOneAndUpdate(
      { employeeId },
      { ...rest, ...(email ? { email } : {}) },
      { new: true, runValidators: true }
    )
      .populate("department")
      .populate("position");

    if (!updated) throw new Error("Failed to update employee");

    revalidateEmployee(employeeId);

    const employeeUpdatedData = toEmployeeDetail(updated);

    return {
      success: true,
      data: employeeUpdatedData,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/** Updates personal-information fields only (name, contact info, avatar, etc). */
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

    await findEmployeeDetailOrThrow(employeeId);
    await assertEmailIsUnique(email, employeeId);

    const updated = await Employee.findOneAndUpdate(
      { employeeId },
      { email, ...rest },
      { new: true, runValidators: true }
    )
      .populate("department")
      .populate("position");

    if (!updated) throw new Error("Failed to update employee profile");

    revalidateEmployee(employeeId);

    return { success: true, data: toEmployeeDetail(updated) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

/** Updates employment-related fields (department, position, status, manager, etc). */
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
      .populate("department")
      .populate("position");

    if (!updated) throw new Error("Failed to update employment information");

    revalidateEmployee(employeeId);

    return { success: true, data: toEmployeeDetail(updated) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
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

    await findEmployeeDetailOrThrow(employeeId);

    const updated = await Employee.findOneAndUpdate(
      { employeeId },
      { emergencyContact },
      { new: true, runValidators: true }
    )
      .populate("department")
      .populate("position");

    if (!updated) throw new Error("Failed to update emergency contact");

    revalidateEmployee(employeeId);

    return { success: true, data: toEmployeeDetail(updated) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
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

    await findEmployeeDetailOrThrow(employeeId);

    const updated = await Employee.findOneAndUpdate(
      { employeeId },
      { address },
      { new: true, runValidators: true }
    )
      .populate("department")
      .populate("position");

    if (!updated) throw new Error("Failed to update address");

    revalidateEmployee(employeeId);

    return { success: true, data: toEmployeeDetail(updated) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

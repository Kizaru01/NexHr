"use server";

import { revalidatePath } from "next/cache";

import {
  ActionResponse,
  CreateEmployeeInput,
  DeleteEmployeeParams,
  EmployeeDetail,
  ErrorResponse,
  GetEmployeeByIdParams,
  GetEmployeesParams,
  GetEmployeesResult,
} from "@/types/global";
import {
  createEmployeeSchema,
  deleteEmployeeSchema,
  getEmployeeByIdSchema,
  getEmployeesSchema,
} from "@/validations/employee.schema";
import action from "../handler/action-helper";
import {
  assertEmployeeIdIsUnique,
  assertEmailIsUnique,
  toEmployeeDetail,
  findEmployeeOrThrow,
  toEmployeeListItem,
} from "../handler/employee.helper";
import handleError from "../handler/error";
import Employee from "@/models/employee.model";
import mongoose from "mongoose";

const EMPLOYEES_PATH = "/employees";

export async function createEmployee(
  params: CreateEmployeeInput
): Promise<ActionResponse<EmployeeDetail>> {
  const validationResult = await action({
    params,
    schema: createEmployeeSchema,
    roles: ["admin", "hr"],
  });

  const employeeParams = validationResult.params as CreateEmployeeInput;
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    await assertEmployeeIdIsUnique(employeeParams.employeeId);
    await assertEmailIsUnique(employeeParams.email);

    const created = await Employee.create(employeeParams);
    const populated = await created.populate(["department", "position"]);

    revalidatePath(EMPLOYEES_PATH);

    return { success: true, data: toEmployeeDetail(populated) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteEmployee(
  params: DeleteEmployeeParams
): Promise<ActionResponse<null>> {
  try {
    const validationResult = await action({
      params,
      schema: deleteEmployeeSchema,
      roles: ["admin", "hr"],
    });

    const { employeeId } = validationResult.params!;

    await findEmployeeOrThrow(employeeId);
    await Employee.deleteOne({ employeeId });

    revalidatePath(EMPLOYEES_PATH);

    return { success: true, data: null };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getEmployeeById(
  params: GetEmployeeByIdParams
): Promise<ActionResponse<EmployeeDetail>> {
  try {
    const validationResult = await action({
      params,
      schema: getEmployeeByIdSchema,
      roles: ["admin", "hr", "employee"],
    });

    const { employeeId } = validationResult.params!;
    const employee = await findEmployeeOrThrow(employeeId);

    return { success: true, data: toEmployeeDetail(employee) };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getEmployees(
  params: GetEmployeesParams = {}
): Promise<ActionResponse<GetEmployeesResult>> {
  try {
    const validationResult = await action({
      params,
      schema: getEmployeesSchema,
      roles: ["admin", "hr"],
    });

    const {
      page = 1,
      pageSize = 10,
      search,
      department,
      employmentStatus,
      employmentType,
    } = validationResult.params!;

    const filter: mongoose.QueryFilter<typeof Employee> = {};

    if (department) filter.department = department;
    if (employmentStatus) filter.employmentStatus = employmentStatus;
    if (employmentType) filter.employmentType = employmentType;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * pageSize;

    const [employees, total] = await Promise.all([
      Employee.find(filter)
        .populate("department")
        .populate("position")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageSize),
      Employee.countDocuments(filter),
    ]);

    return {
      success: true,
      data: {
        employees: employees.map(toEmployeeListItem),
        total,
        page,
        pageSize,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

import Department from "@/models/department.model";
import Employee from "@/models/employee.model";
import Position from "@/models/position.model";
import type {
  ActionResponse,
  CreateEmployeeInput,
  DeleteEmployeeParams,
  EmployeeDetail,
  EmployeeListItem,
  ErrorResponse,
  GetEmployeeByIdParams,
  GetEmployeesParams,
} from "@/types/global";
import {
  createEmployeeSchema,
  deleteEmployeeSchema,
  getEmployeeByIdSchema,
  getEmployeesSchema,
} from "@/validations/employee.schema";
import action from "../../handler/action-helper";
import {
  assertEmailIsUnique,
  findEmployeeDetailOrThrow,
  toEmployeeDetail,
} from "../../handler/employee.helper";
import handleError from "../../handler/error";
import { getNextEmployeeId } from "../../handler/employee-id.helper";
import {
  ConflictError,
  NotFoundError,
  isDuplicateKeyError,
} from "../../http-errors";

const EMPLOYEES_PATH = "/employees";
const MAX_TRANSACTION_ATTEMPTS = 8;
const MAX_COMMIT_ATTEMPTS = 3;

type ErrorWithLabels = {
  hasErrorLabel?: (label: string) => boolean;
};

function hasErrorLabel(error: unknown, label: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as ErrorWithLabels).hasErrorLabel === "function" &&
    (error as ErrorWithLabels).hasErrorLabel!(label)
  );
}
function isTransientTransactionError(error: unknown): boolean {
  return hasErrorLabel(error, "TransientTransactionError");
}

async function commitTransactionWithRetry(
  session: mongoose.ClientSession
): Promise<void> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_COMMIT_ATTEMPTS; attempt += 1) {
    try {
      await session.commitTransaction();
      return;
    } catch (error) {
      lastError = error;

      if (
        !hasErrorLabel(error, "UnknownTransactionCommitResult") ||
        attempt === MAX_COMMIT_ATTEMPTS
      ) {
        throw error;
      }
    }
  }

  throw lastError;
}

async function waitBeforeTransactionRetry(attempt: number): Promise<void> {
  const backoffMs = Math.min(25 * 2 ** (attempt - 1), 400);
  const jitterMs = Math.floor(Math.random() * 25);

  await new Promise<void>((resolve) => {
    setTimeout(resolve, backoffMs + jitterMs);
  });
}

async function findEmployeeByCreationRequestId(
  requestId: string,
  session: mongoose.ClientSession
) {
  return Employee.findOne({ creationRequestId: requestId })
    .session(session)
    .populate([
      { path: "department", options: { session } },
      { path: "position", options: { session } },
      { path: "manager", options: { session } },
    ]);
}

async function findCommittedEmployeeByCreationRequestId(requestId: string) {
  return Employee.findOne({ creationRequestId: requestId }).populate([
    { path: "department" },
    { path: "position" },
    { path: "manager" },
  ]);
}

async function createEmployeeInTransaction(
  employeeParams: CreateEmployeeInput
): Promise<EmployeeDetail> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt += 1) {
    let session: mongoose.ClientSession | undefined;
    let counterReserved = false;

    try {
      session = await mongoose.startSession();
      await session.startTransaction();

      const existingEmployee = await findEmployeeByCreationRequestId(
        employeeParams.requestId,
        session
      );

      if (existingEmployee) {
        const employeeDetail = toEmployeeDetail(existingEmployee);

        await commitTransactionWithRetry(session);

        return employeeDetail;
      }

      await assertEmailIsUnique(employeeParams.email, undefined, session);

      const [department, position, manager] = await Promise.all([
        Department.exists({
          _id: employeeParams.department,
          isActive: true,
        }).session(session),
        Position.exists({
          _id: employeeParams.position,
          department: employeeParams.department,
          isActive: true,
        }).session(session),
        employeeParams.manager
          ? Employee.exists({
              _id: employeeParams.manager,
              employmentStatus: "Active",
            }).session(session)
          : Promise.resolve(true),
      ]);

      if (!department) throw new NotFoundError("Department");
      if (!position) throw new NotFoundError("Position");
      if (!manager) throw new NotFoundError("Manager");

      const employeeId = await getNextEmployeeId(session);
      counterReserved = true;
      const { requestId, ...employeeData } = employeeParams;

      const [employee] = await Employee.create(
        [
          {
            ...employeeData,
            employeeId,
            creationRequestId: requestId,
          },
        ],
        { session }
      );
      await employee.populate([
        { path: "department", options: { session } },
        { path: "position", options: { session } },
        { path: "manager", options: { session } },
      ]);

      const employeeDetails = toEmployeeDetail(employee);

      await commitTransactionWithRetry(session);

      return employeeDetails;
    } catch (error) {
      if (session?.inTransaction()) {
        try {
          await session.abortTransaction();
        } catch {
          // The original transaction error is the actionable failure.
        }
      }

      lastError = error;

      if (
        (isTransientTransactionError(error) ||
          (!counterReserved && isDuplicateKeyError(error))) &&
        attempt < MAX_TRANSACTION_ATTEMPTS
      ) {
        await waitBeforeTransactionRetry(attempt);
        continue;
      }

      throw error;
    } finally {
      await session?.endSession();
    }
  }

  throw lastError ?? new Error("Employee creation transaction failed.");
}

export async function createEmployee(
  params: CreateEmployeeInput
): Promise<ActionResponse> {
  try {
    const validationResult = await action({
      params,
      schema: createEmployeeSchema,
      roles: ["admin", "hr"],
    });
    const employeeData = validationResult.params!;

    await createEmployeeInTransaction(employeeData);

    revalidatePath(EMPLOYEES_PATH);

    return { success: true };
  } catch (error) {
    if (
      isDuplicateKeyError(error) ||
      hasErrorLabel(error, "UnknownTransactionCommitResult")
    ) {
      try {
        const existingEmployee = await findCommittedEmployeeByCreationRequestId(
          params.requestId
        );

        const employeeDetails = toEmployeeDetail(existingEmployee);

        if (existingEmployee) {
          revalidatePath(EMPLOYEES_PATH);
          return {
            success: true,
            data: JSON.parse(JSON.stringify(employeeDetails)),
          };
        }
      } catch {
        // Preserve the original transaction error if the reconciliation read fails.
        return handleError(error) as ErrorResponse;
      }
    }

    if (isDuplicateKeyError(error)) {
      const duplicateError = new ConflictError(
        "An employee with this email or employee ID already exists."
      );
      return handleError(duplicateError) as ErrorResponse;
    }

    return handleError(error) as ErrorResponse;
  }
}

export async function deleteEmployee(
  params: DeleteEmployeeParams
): Promise<ActionResponse> {
  try {
    const validationResult = await action({
      params,
      schema: deleteEmployeeSchema,
      roles: ["admin", "hr"],
    });

    const { employeeId } = validationResult.params!;

    await findEmployeeDetailOrThrow(employeeId);

    await Employee.deleteOne({ employeeId });

    revalidatePath(EMPLOYEES_PATH);

    return { success: true };
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
    const employee = await findEmployeeDetailOrThrow(employeeId);

    const employeeDetail = toEmployeeDetail(employee);

    return { success: true, data: employeeDetail };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function getEmployees(
  params: GetEmployeesParams = {}
): Promise<ActionResponse<{ employees: EmployeeListItem[]; isNext: boolean }>> {
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

    const skip = (Number(page) - 1) * Number(pageSize);
    const limit = Number(pageSize);
    const searchQuery: mongoose.QueryFilter<typeof Employee> = {};

    if (department) searchQuery.department = department;
    if (employmentStatus) searchQuery.employmentStatus = employmentStatus;
    if (employmentType) searchQuery.employmentType = employmentType;
    if (search) {
      searchQuery.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
      ];
    }

    const [employees, totalEmployees] = await Promise.all([
      Employee.find(searchQuery)
        .populate("department")
        .populate("position")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Employee.countDocuments(searchQuery),
    ]);

    const isNext = totalEmployees > skip + employees.length;

    return {
      success: true,
      data: {
        employees,
        isNext,
      },
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

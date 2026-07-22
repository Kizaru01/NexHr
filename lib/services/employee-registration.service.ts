import "server-only";

import mongoose from "mongoose";

import { toEmployeeDetail } from "@/lib/handler/employee.helper";
import { getNextEmployeeId } from "@/lib/handler/employee-id.helper";
import {
  assertEmailIsUnique,
  getUserEmail,
  getUserId,
  isUserActive,
} from "@/lib/handler/user.helper";
import { isDuplicateKeyError, NotFoundError } from "@/lib/http-errors";
import Department from "@/models/department.model";
import Employee, { type IEmployeeDoc } from "@/models/employee.model";
import Position from "@/models/position.model";
import User from "@/models/user.model";
import type { CreateEmployeeInput, EmployeeDetail } from "@/types/global";

const MAX_TRANSACTION_ATTEMPTS = 8;
const MAX_COMMIT_ATTEMPTS = 3;

type ErrorWithLabels = {
  hasErrorLabel?: (label: string) => boolean;
};

export type EmployeeRegistrationResult = {
  employee: EmployeeDetail;
  email: string;
  userId: string;
  requestId: string;
  shouldSendWelcomeEmail: boolean;
};

export function hasTransactionErrorLabel(
  error: unknown,
  label: string
): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    typeof (error as ErrorWithLabels).hasErrorLabel === "function" &&
    (error as ErrorWithLabels).hasErrorLabel!(label)
  );
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
        !hasTransactionErrorLabel(error, "UnknownTransactionCommitResult") ||
        attempt === MAX_COMMIT_ATTEMPTS
      ) {
        throw error;
      }
    }
  }

  throw lastError;
}

async function waitBeforeRetry(attempt: number): Promise<void> {
  const backoffMs = Math.min(25 * 2 ** (attempt - 1), 400);
  const jitterMs = Math.floor(Math.random() * 25);

  await new Promise<void>((resolve) => {
    setTimeout(resolve, backoffMs + jitterMs);
  });
}

function populateEmployeeRegistration(
  employee: IEmployeeDoc,
  session?: mongoose.ClientSession
): Promise<IEmployeeDoc> {
  const options = session ? { session } : undefined;

  return employee.populate([
    { path: "userId", select: "email isActive", options },
    { path: "department", options },
    { path: "position", options },
    { path: "manager", options },
  ]);
}

async function findByCreationRequestId(
  requestId: string,
  session?: mongoose.ClientSession
): Promise<IEmployeeDoc | null> {
  const query = Employee.findOne({ creationRequestId: requestId });
  if (session) query.session(session);

  const employee = await query;
  return employee ? populateEmployeeRegistration(employee, session) : null;
}

function toRegistrationResult(
  employee: IEmployeeDoc,
  requestId: string
): EmployeeRegistrationResult {
  return {
    employee: toEmployeeDetail(employee),
    email: getUserEmail(employee.userId),
    userId: getUserId(employee.userId),
    requestId,
    shouldSendWelcomeEmail: !isUserActive(employee.userId),
  };
}

async function executeRegistrationTransaction(
  employeeParams: CreateEmployeeInput
): Promise<EmployeeRegistrationResult> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_TRANSACTION_ATTEMPTS; attempt += 1) {
    const session = await mongoose.startSession();

    try {
      session.startTransaction();

      const existingEmployee = await findByCreationRequestId(
        employeeParams.requestId,
        session
      );

      if (existingEmployee) {
        const result = toRegistrationResult(
          existingEmployee,
          employeeParams.requestId
        );
        await commitTransactionWithRetry(session);
        return result;
      }

      await assertEmailIsUnique(employeeParams.email, undefined, session);

      const department = await Department.exists({
        _id: employeeParams.department,
        isActive: true,
      }).session(session);
      if (!department) throw new NotFoundError("Department");

      const position = await Position.exists({
        _id: employeeParams.position,
        department: employeeParams.department,
        isActive: true,
      }).session(session);
      if (!position) throw new NotFoundError("Position");

      const manager = employeeParams.manager
        ? await Employee.exists({
            _id: employeeParams.manager,
            employmentStatus: "Active",
          }).session(session)
        : true;
      if (!manager) throw new NotFoundError("Manager");

      const employeeId = await getNextEmployeeId(session);
      const { requestId, email, ...employeeData } = employeeParams;
      const [user] = await User.create(
        [{ email, role: "employee", isActive: false }],
        { session }
      );
      const [employee] = await Employee.create(
        [
          {
            ...employeeData,
            userId: user._id,
            employeeId,
            creationRequestId: requestId,
          },
        ],
        { session }
      );

      await populateEmployeeRegistration(employee, session);
      const result = toRegistrationResult(employee, requestId);

      await commitTransactionWithRetry(session);
      return result;
    } catch (error) {
      if (session.inTransaction()) {
        try {
          await session.abortTransaction();
        } catch {
          // Preserve the original transaction failure.
        }
      }

      lastError = error;
      const retryable =
        hasTransactionErrorLabel(error, "TransientTransactionError") ||
        isDuplicateKeyError(error);

      if (retryable && attempt < MAX_TRANSACTION_ATTEMPTS) {
        await waitBeforeRetry(attempt);
        continue;
      }

      throw error;
    } finally {
      await session.endSession();
    }
  }

  throw lastError ?? new Error("Employee registration transaction failed.");
}

export async function registerEmployeeAccount(
  employeeParams: CreateEmployeeInput
): Promise<EmployeeRegistrationResult> {
  try {
    return await executeRegistrationTransaction(employeeParams);
  } catch (error) {
    if (
      isDuplicateKeyError(error) ||
      hasTransactionErrorLabel(error, "UnknownTransactionCommitResult")
    ) {
      const committedEmployee = await findByCreationRequestId(
        employeeParams.requestId
      );

      if (committedEmployee) {
        return toRegistrationResult(
          committedEmployee,
          employeeParams.requestId
        );
      }
    }

    throw error;
  }
}

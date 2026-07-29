"use server";

import { randomUUID } from "node:crypto";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import action from "@/lib/handler/action-helper";
import {
  findEmployeeDetailOrThrow,
  toEmployeeDetail,
  toEmployeeListItem,
} from "@/lib/handler/employee.helper";
import handleError from "@/lib/handler/error";
import { findUserIdsByEmailSearch, getUserId } from "@/lib/handler/user.helper";
import {
  ConflictError,
  isDuplicateKeyError,
  NotFoundError,
  RequestError,
} from "@/lib/http-errors";
import logger from "@/lib/logger";
import { getActivationTokenExpiresAt } from "@/lib/services/activation-token.service";
import { registerEmployeeAccount } from "@/lib/services/employee-registration.service";
import { deliverEmployeeWelcomeEmail } from "@/lib/services/employee-welcome-email.service";
import Department from "@/models/department.model";
import Employee from "@/models/employee.model";
import User from "@/models/user.model";
import type {
  ActionResponse,
  CreateEmployeeInput,
  DeleteEmployeeParams,
  EmployeeDetail,
  EmployeeListItem,
  GetEmployeeByIdParams,
  GetEmployeesParams,
  ResendEmployeeWelcomeEmailParams,
} from "@/types/global";
import {
  createEmployeeSchema,
  deleteEmployeeSchema,
  getEmployeeByIdSchema,
  getEmployeesSchema,
  resendEmployeeWelcomeEmailSchema,
} from "@/validations/employee.schema";

const EMPLOYEES_PATH = "/employees";
const WELCOME_EMAIL_RETRY_LOCK_MS = 60_000;

export async function createEmployee(
  params: CreateEmployeeInput
): Promise<ActionResponse<EmployeeDetail>> {
  try {
    const validationResult = await action({
      params,
      schema: createEmployeeSchema,
      roles: ["admin", "hr"],
    });
    const data = validationResult.params!;

    const registration = await registerEmployeeAccount(data);
    let warning: { message: string } | undefined;

    if (registration.shouldSendWelcomeEmail) {
      try {
        await deliverEmployeeWelcomeEmail({
          activationIssuedAt: registration.activationIssuedAt,
          email: registration.email,
          employeeId: registration.employee.employeeId,
          tokenId: registration.requestId,
          userId: registration.userId,
        });
      } catch (emailError) {
        logger.error(
          {
            err: emailError,
            employeeId: registration.employee.employeeId,
            userId: registration.userId,
          },
          "Employee created, but the welcome email could not be sent."
        );
        warning = {
          message:
            "Employee created successfully, but the welcome email could not be sent.",
        };
      }
    }

    revalidatePath(EMPLOYEES_PATH);

    return {
      success: true,
      data: registration.employee,
      ...(warning ? { warning } : {}),
    };
  } catch (error) {
    return handleError(
      isDuplicateKeyError(error)
        ? new ConflictError(
            "An employee account with this email or request already exists."
          )
        : error
    );
  }
}

export async function resendEmployeeWelcomeEmail(
  params: ResendEmployeeWelcomeEmailParams
): Promise<ActionResponse<null>> {
  try {
    const validationResult = await action({
      params,
      schema: resendEmployeeWelcomeEmailSchema,
      roles: ["admin", "hr"],
    });
    const { employeeId } = validationResult.params!;
    const employee = await Employee.findOne({ employeeId })
      .select("employeeId userId")
      .lean();

    if (!employee) {
      throw new NotFoundError("Employee");
    }

    const attemptedAt = new Date();
    const tokenId = randomUUID();
    const retryLockedUntil = new Date(
      attemptedAt.getTime() + WELCOME_EMAIL_RETRY_LOCK_MS
    );
    const user = await User.findOneAndUpdate(
      {
        _id: employee.userId,
        isActive: false,
        welcomeEmailStatus: "failed",
        $or: [
          { welcomeEmailRetryLockedUntil: { $exists: false } },
          { welcomeEmailRetryLockedUntil: { $lte: attemptedAt } },
        ],
      },
      {
        $set: {
          activationIssuedAt: attemptedAt,
          activationTokenId: tokenId,
          activationTokenExpiresAt:
            getActivationTokenExpiresAt(attemptedAt),
          welcomeEmailLastAttemptAt: attemptedAt,
          welcomeEmailRetryLockedUntil: retryLockedUntil,
        },
      },
      {
        new: true,
        runValidators: true,
      }
    )
      .select("email")
      .lean();

    if (!user) {
      const currentUser = await User.findById(employee.userId)
        .select(
          "isActive welcomeEmailStatus +welcomeEmailRetryLockedUntil"
        )
        .lean();

      if (!currentUser) {
        throw new NotFoundError("Employee user account");
      }
      if (currentUser.isActive) {
        throw new ConflictError("This employee account is already active.");
      }
      if (currentUser.welcomeEmailStatus !== "failed") {
        throw new ConflictError("The welcome email was already sent.");
      }
      if (
        currentUser.welcomeEmailRetryLockedUntil &&
        currentUser.welcomeEmailRetryLockedUntil > attemptedAt
      ) {
        throw new ConflictError(
          "A welcome email retry is already in progress."
        );
      }

      throw new ConflictError(
        "The welcome email retry could not be started. Please try again."
      );
    }

    try {
      await deliverEmployeeWelcomeEmail({
        activationIssuedAt: attemptedAt,
        email: user.email,
        employeeId: employee.employeeId,
        tokenId,
        userId: user._id.toString(),
      });
    } catch (emailError) {
      logger.error(
        {
          err: emailError,
          employeeId: employee.employeeId,
          userId: user._id.toString(),
        },
        "The welcome email retry failed."
      );
      throw new RequestError(
        502,
        "The welcome email could not be sent. Please try again."
      );
    }

    revalidatePath(EMPLOYEES_PATH);
    revalidatePath(`${EMPLOYEES_PATH}/${employee.employeeId}`);

    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
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
    const employee = await findEmployeeDetailOrThrow(employeeId);
    const userId = getUserId(employee.userId);
    const session = await mongoose.startSession();

    try {
      await session.withTransaction(async (): Promise<void> => {
        await Department.updateMany(
          { manager: employee._id },
          { $unset: { manager: "" } },
          { session }
        );
        const employeeResult = await Employee.deleteOne({
          _id: employee._id,
        }).session(session);
        const userResult = await User.deleteOne({ _id: userId }).session(
          session
        );

        if (
          employeeResult.deletedCount !== 1 ||
          userResult.deletedCount !== 1
        ) {
          throw new Error("Employee account deletion was not completed.");
        }
      });
    } finally {
      await session.endSession();
    }

    revalidatePath(EMPLOYEES_PATH);
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
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
    const employee = await findEmployeeDetailOrThrow(
      validationResult.params!.employeeId
    );

    return { success: true, data: toEmployeeDetail(employee) };
  } catch (error) {
    return handleError(error);
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
      const matchingUserIds = await findUserIdsByEmailSearch(search);
      searchQuery.$or = [
        { firstName: { $regex: search, $options: "i" } },
        { lastName: { $regex: search, $options: "i" } },
        { employeeId: { $regex: search, $options: "i" } },
        { userId: { $in: matchingUserIds } },
      ];
    }

    const [employees, totalEmployees] = await Promise.all([
      Employee.find(searchQuery)
        .populate("userId", "email")
        .populate("department")
        .populate("position")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Employee.countDocuments(searchQuery),
    ]);

    return {
      success: true,
      data: {
        employees: employees.map(toEmployeeListItem),
        isNext: totalEmployees > skip + employees.length,
      },
    };
  } catch (error) {
    return handleError(error);
  }
}

"use server";

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
import { ConflictError, isDuplicateKeyError } from "@/lib/http-errors";
import logger from "@/lib/logger";
import { createActivationToken } from "@/lib/services/activation-token.service";
import emailService from "@/lib/services/email.service";
import { registerEmployeeAccount } from "@/lib/services/employee-registration.service";
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
} from "@/types/global";
import {
  createEmployeeSchema,
  deleteEmployeeSchema,
  getEmployeeByIdSchema,
  getEmployeesSchema,
} from "@/validations/employee.schema";

const EMPLOYEES_PATH = "/employees";

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
        const activationToken = createActivationToken({
          userId: registration.userId,
          email: registration.email,
          issuedAt: registration.activationIssuedAt,
          tokenId: registration.requestId,
        });
        await emailService.sendWelcomeEmail({
          to: registration.email,
          employeeName: [
            registration.employee.firstName,
            registration.employee.lastName,
          ].join(" "),
          employeeId: registration.employee.employeeId,
          activationToken,
          requestId: registration.requestId,
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
        const [employeeResult, userResult] = await Promise.all([
          Employee.deleteOne({ _id: employee._id }).session(session),
          User.deleteOne({ _id: userId }).session(session),
        ]);

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

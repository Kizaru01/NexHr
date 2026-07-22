"use server";

import { revalidatePath } from "next/cache";

import action from "@/lib/handler/action-helper";
import {
  balanceFor,
  getLeaveBalances,
} from "@/lib/queries/employee-portal/employee-portal.shared";
import { leaveDurationInDays, type LeaveType } from "@/lib/queries/policy";
import { requireEmployeeRecord } from "@/lib/handler/require-employee";
import handleError from "@/lib/handler/error";
import { ConflictError, NotFoundError } from "@/lib/http-errors";
import Leave from "@/models/leave.model";
import type { LeaveAvailabilityParams } from "@/types/employee-portal";
import type { ActionResponse, ErrorResponse } from "@/types/global";
import {
  cancelLeaveRequestSchema,
  leaveRequestSchema,
  updateLeaveRequestSchema,
  type LeaveRequestInput,
  type UpdateLeaveRequestInput,
} from "@/validations/employee-portal.schema";

async function validateLeaveAvailability({
  employeeId,
  values,
  excludeLeaveId,
  existingDuration,
}: LeaveAvailabilityParams): Promise<void> {
  const { endDate, leaveType, startDate } = values;
  const overlap = await Leave.exists({
    employee: employeeId,
    status: { $in: ["Pending", "Approved"] },
    ...(excludeLeaveId ? { _id: { $ne: excludeLeaveId } } : {}),
    startDate: { $lte: endDate },
    endDate: { $gte: startDate },
  });

  if (overlap) {
    throw new ConflictError(
      "This leave request overlaps an existing pending or approved request."
    );
  }

  const requestedDays = leaveDurationInDays(startDate, endDate);
  const balances = await getLeaveBalances(employeeId);
  const balance = balanceFor(balances, leaveType as LeaveType);
  const availableDays =
    balance.available === null
      ? null
      : balance.available + (existingDuration ?? 0);

  if (availableDays !== null && requestedDays > availableDays) {
    throw new ConflictError(
      `Only ${availableDays} ${leaveType.toLowerCase()} leave day(s) are available.`
    );
  }
}

function revalidateLeavePortal(): void {
  revalidatePath("/employee");
  revalidatePath("/employee/leave");
}

export async function createOwnLeaveRequest(
  params: LeaveRequestInput
): Promise<ActionResponse> {
  try {
    const validated = await action({
      params,
      schema: leaveRequestSchema,
      roles: ["employee"],
    });
    const { params: validatedParams, session } = validated;
    const employee = await requireEmployeeRecord(session.user.id);
    const { employeeDatabaseId } = employee;

    await validateLeaveAvailability({
      employeeId: employeeDatabaseId,
      values: validatedParams!,
    });
    await Leave.create({
      employee: employeeDatabaseId,
      ...validatedParams,
      status: "Pending",
    });

    revalidateLeavePortal();
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateOwnPendingLeaveRequest(
  params: UpdateLeaveRequestInput
): Promise<ActionResponse> {
  try {
    const validated = await action({
      params,
      schema: updateLeaveRequestSchema,
      roles: ["employee"],
    });
    const { params: validatedParams, session } = validated;
    const employee = await requireEmployeeRecord(session.user.id);
    const { employeeDatabaseId } = employee;
    const { attachment, leaveId, ...values } = validatedParams!;
    const currentRequest = await Leave.findOne({
      _id: leaveId,
      employee: employeeDatabaseId,
      status: "Pending",
    }).select("startDate endDate");

    if (!currentRequest) {
      throw new NotFoundError("Pending leave request");
    }

    const existingDuration = leaveDurationInDays(
      currentRequest.startDate,
      currentRequest.endDate
    );
    await validateLeaveAvailability({
      employeeId: employeeDatabaseId,
      values,
      excludeLeaveId: leaveId,
      existingDuration,
    });
    await Leave.findByIdAndUpdate(leaveId, {
      $set: { ...values, ...(attachment ? { attachment } : {}) },
    });

    revalidateLeavePortal();
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function cancelOwnPendingLeaveRequest(params: {
  leaveId: string;
}): Promise<ActionResponse> {
  try {
    const validated = await action({
      params,
      schema: cancelLeaveRequestSchema,
      roles: ["employee"],
    });
    const { params: validatedParams, session } = validated;
    const employee = await requireEmployeeRecord(session.user.id);
    const { employeeDatabaseId } = employee;
    const { leaveId } = validatedParams!;
    const request = await Leave.findOneAndUpdate(
      {
        _id: leaveId,
        employee: employeeDatabaseId,
        status: "Pending",
      },
      { $set: { status: "Cancelled" } },
      { new: true }
    );

    if (!request) throw new NotFoundError("Pending leave request");

    revalidateLeavePortal();
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

"use server";

import { revalidatePath } from "next/cache";

import action from "@/lib/handler/action-helper";
import { balanceFor, getLeaveBalances } from "@/queries/employee-portal.shared";
import { leaveDurationInDays, type LeaveType } from "@/lib/employee-portal/policy";
import { requireEmployeeRecord } from "@/lib/handler/require-employee";
import handleError from "@/lib/handler/error";
import { ConflictError, NotFoundError } from "@/lib/http-errors";
import Leave from "@/models/leave.model";
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
}: {
  employeeId: string;
  values: LeaveRequestInput;
  excludeLeaveId?: string;
  existingDuration?: number;
}): Promise<void> {
  const overlap = await Leave.exists({
    employee: employeeId,
    status: { $in: ["Pending", "Approved"] },
    ...(excludeLeaveId ? { _id: { $ne: excludeLeaveId } } : {}),
    startDate: { $lte: values.endDate },
    endDate: { $gte: values.startDate },
  });

  if (overlap) {
    throw new ConflictError(
      "This leave request overlaps an existing pending or approved request."
    );
  }

  const requestedDays = leaveDurationInDays(values.startDate, values.endDate);
  const balances = await getLeaveBalances(employeeId);
  const balance = balanceFor(balances, values.leaveType as LeaveType);
  const availableDays =
    balance.available === null
      ? null
      : balance.available + (existingDuration ?? 0);

  if (availableDays !== null && requestedDays > availableDays) {
    throw new ConflictError(
      `Only ${availableDays} ${values.leaveType.toLowerCase()} leave day(s) are available.`
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
    const employee = await requireEmployeeRecord(validated.session.user.id);

    await validateLeaveAvailability({
      employeeId: employee.employeeDatabaseId,
      values: validated.params!,
    });
    await Leave.create({
      employee: employee.employeeDatabaseId,
      ...validated.params,
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
    const employee = await requireEmployeeRecord(validated.session.user.id);
    const currentRequest = await Leave.findOne({
      _id: validated.params!.leaveId,
      employee: employee.employeeDatabaseId,
      status: "Pending",
    }).select("startDate endDate");

    if (!currentRequest) {
      throw new NotFoundError("Pending leave request");
    }

    const existingDuration = leaveDurationInDays(
      currentRequest.startDate,
      currentRequest.endDate
    );
    const { leaveId, attachment, ...values } = validated.params!;

    await validateLeaveAvailability({
      employeeId: employee.employeeDatabaseId,
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
    const employee = await requireEmployeeRecord(validated.session.user.id);
    const request = await Leave.findOneAndUpdate(
      {
        _id: validated.params!.leaveId,
        employee: employee.employeeDatabaseId,
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

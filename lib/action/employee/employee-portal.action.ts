"use server";

import { revalidatePath } from "next/cache";

import action from "@/lib/handler/action-helper";
import { assertEmailIsUnique } from "@/lib/handler/employee.helper";
import { requireEmployeeRecord } from "@/lib/handler/require-employee";
import handleError from "@/lib/handler/error";
import { ConflictError, NotFoundError } from "@/lib/http-errors";
import Attendance from "@/models/attendance.model";
import AttendanceCorrection from "@/models/attendance-correction.model";
import Employee from "@/models/employee.model";
import User from "@/models/user.model";
import type { ActionResponse, ErrorResponse } from "@/types/global";
import {
  attendanceCorrectionSchema,
  notificationPreferencesSchema,
  ownEmployeeProfileSchema,
  profileImageSchema,
  type NotificationPreferencesInput,
  type OwnEmployeeProfileInput,
} from "@/validations/employee-portal.schema";

function revalidateEmployeePortal(path?: string): void {
  revalidatePath("/employee");
  revalidatePath("/employee/profile");
  revalidatePath("/employee/settings");
  if (path) revalidatePath(path);
}

export async function updateOwnEmployeeProfile(
  params: OwnEmployeeProfileInput
): Promise<ActionResponse> {
  try {
    const validated = await action({
      params,
      schema: ownEmployeeProfileSchema,
      roles: ["employee"],
    });
    const employee = await requireEmployeeRecord(validated.session.user.id);

    await assertEmailIsUnique(validated.params!.email, employee.employeeCode);
    await Employee.findByIdAndUpdate(
      employee.employeeDatabaseId,
      { $set: validated.params },
      { runValidators: true }
    );

    revalidateEmployeePortal();
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateOwnProfileImage(params: {
  avatar: string;
}): Promise<ActionResponse> {
  try {
    const validated = await action({
      params,
      schema: profileImageSchema,
      roles: ["employee"],
    });
    const employee = await requireEmployeeRecord(validated.session.user.id);

    await Employee.findByIdAndUpdate(employee.employeeDatabaseId, {
      $set: { avatar: validated.params!.avatar },
    });

    revalidateEmployeePortal();
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateNotificationPreferences(
  params: NotificationPreferencesInput
): Promise<ActionResponse> {
  try {
    const validated = await action({
      params,
      schema: notificationPreferencesSchema,
      roles: ["employee"],
    });

    await User.findByIdAndUpdate(validated.session.user.id, {
      $set: { notificationPreferences: validated.params },
    });

    revalidateEmployeePortal();
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function submitAttendanceCorrection(params: {
  attendanceId: string;
  reason: string;
}): Promise<ActionResponse> {
  try {
    const validated = await action({
      params,
      schema: attendanceCorrectionSchema,
      roles: ["employee"],
    });
    const employee = await requireEmployeeRecord(validated.session.user.id);
    const attendance = await Attendance.exists({
      _id: validated.params!.attendanceId,
      employee: employee.employeeDatabaseId,
    });

    if (!attendance) throw new NotFoundError("Attendance record");

    const pendingRequest = await AttendanceCorrection.exists({
      employee: employee.employeeDatabaseId,
      attendance: validated.params!.attendanceId,
      status: "Pending",
    });
    if (pendingRequest) {
      throw new ConflictError(
        "A correction request for this attendance record is already pending."
      );
    }

    await AttendanceCorrection.create({
      employee: employee.employeeDatabaseId,
      attendance: validated.params!.attendanceId,
      reason: validated.params!.reason,
    });

    revalidateEmployeePortal(`/employee/attendance/${validated.params!.attendanceId}`);
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

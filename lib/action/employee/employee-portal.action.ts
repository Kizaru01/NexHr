"use server";

import { revalidatePath } from "next/cache";

import action from "@/lib/handler/action-helper";
import { updateEmployeeAndUserProfile } from "@/lib/handler/employee-profile.helper";
import { requireEmployeeRecord } from "@/lib/handler/require-employee";
import handleError from "@/lib/handler/error";
import { ConflictError, NotFoundError } from "@/lib/http-errors";
import Attendance from "@/models/attendance.model";
import AttendanceCorrection from "@/models/attendance-correction.model";
import Employee from "@/models/employee.model";
import User from "@/models/user.model";
import type { ActionResponse } from "@/types/global";
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
): Promise<ActionResponse<null>> {
  try {
    const validated = await action({
      params,
      schema: ownEmployeeProfileSchema,
      roles: ["employee"],
    });
    const { params: validatedParams, session } = validated;
    const employee = await requireEmployeeRecord(session.user.id);
    const { employeeDatabaseId } = employee;
    const { email, ...employeeUpdates } = validatedParams!;

    await updateEmployeeAndUserProfile({
      employeeDatabaseId,
      userId: session.user.id,
      email,
      employeeUpdates,
    });

    revalidateEmployeePortal();
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateOwnProfileImage(params: {
  avatar: string;
}): Promise<ActionResponse<null>> {
  try {
    const validated = await action({
      params,
      schema: profileImageSchema,
      roles: ["employee"],
    });
    const { params: validatedParams, session } = validated;
    const employee = await requireEmployeeRecord(session.user.id);
    const { employeeDatabaseId } = employee;
    const { avatar } = validatedParams!;

    await Employee.findByIdAndUpdate(employeeDatabaseId, {
      $set: { avatar },
    });

    revalidateEmployeePortal();
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateNotificationPreferences(
  params: NotificationPreferencesInput
): Promise<ActionResponse<null>> {
  try {
    const validated = await action({
      params,
      schema: notificationPreferencesSchema,
      roles: ["employee"],
    });
    const { params: validatedParams, session } = validated;

    await User.findByIdAndUpdate(session.user.id, {
      $set: { notification: validatedParams },
    });

    revalidateEmployeePortal();
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

export async function submitAttendanceCorrection(params: {
  attendanceId: string;
  reason: string;
}): Promise<ActionResponse<null>> {
  try {
    const validated = await action({
      params,
      schema: attendanceCorrectionSchema,
      roles: ["employee"],
    });
    const { params: validatedParams, session } = validated;
    const employee = await requireEmployeeRecord(session.user.id);
    const { employeeDatabaseId } = employee;
    const { attendanceId, reason } = validatedParams!;
    const attendance = await Attendance.exists({
      _id: attendanceId,
      employee: employeeDatabaseId,
    });

    if (!attendance) throw new NotFoundError("Attendance record");

    const pendingRequest = await AttendanceCorrection.exists({
      employee: employeeDatabaseId,
      attendance: attendanceId,
      status: "Pending",
    });
    if (pendingRequest) {
      throw new ConflictError(
        "A correction request for this attendance record is already pending."
      );
    }

    await AttendanceCorrection.create({
      employee: employeeDatabaseId,
      attendance: attendanceId,
      reason,
    });

    revalidateEmployeePortal(`/employee/attendance/${attendanceId}`);
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

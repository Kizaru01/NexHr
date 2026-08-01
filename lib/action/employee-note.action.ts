"use server";

import { revalidatePath } from "next/cache";

import action from "@/lib/handler/action-helper";
import handleError from "@/lib/handler/error";
import { NotFoundError } from "@/lib/http-errors";
import EmployeeProfileNote from "@/models/employee-profile-note.model";
import Employee from "@/models/employee.model";
import type { ActionResponse } from "@/types/global";
import {
  deleteEmployeeProfileNoteSchema,
  employeeProfileNoteSchema,
  updateEmployeeProfileNoteSchema,
  type EmployeeProfileNoteInput,
  type UpdateEmployeeProfileNoteInput,
} from "@/validations/note.schema";

function revalidateEmployeeNoteViews(employeeId: string): void {
  revalidatePath(`/employees/${employeeId}`);
  revalidatePath("/employee");
  revalidatePath("/employee/profile");
}

export async function addEmployeeProfileNote(
  params: EmployeeProfileNoteInput
): Promise<ActionResponse<null>> {
  try {
    const result = await action({
      params,
      schema: employeeProfileNoteSchema,
      roles: ["admin", "hr"],
    });
    const values = result.params!;
    const { session } = result;
    const employee = await Employee.findOne({
      employeeId: values.employeeId,
    }).select("_id employeeId");

    if (!employee) throw new NotFoundError("Employee");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + values.durationDays);

    await EmployeeProfileNote.create({
      employee: employee._id,
      author: session.user.id,
      body: values.note,
      expiresAt,
    });

    revalidateEmployeeNoteViews(employee.employeeId);
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateEmployeeProfileNote(
  params: UpdateEmployeeProfileNoteInput
): Promise<ActionResponse<null>> {
  try {
    const result = await action({
      params,
      schema: updateEmployeeProfileNoteSchema,
      roles: ["admin", "hr"],
    });
    const values = result.params!;
    const profileNote = await EmployeeProfileNote.findById(values.noteId);

    if (!profileNote) throw new NotFoundError("Note");

    const employee = await Employee.findById(profileNote.employee)
      .select("employeeId")
      .lean();
    if (!employee) throw new NotFoundError("Employee");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + values.durationDays);

    profileNote.body = values.note;
    profileNote.expiresAt = expiresAt;
    await profileNote.save();

    revalidateEmployeeNoteViews(employee.employeeId);
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

export async function deleteEmployeeProfileNote(params: {
  noteId: string;
}): Promise<ActionResponse<null>> {
  try {
    const result = await action({
      params,
      schema: deleteEmployeeProfileNoteSchema,
      roles: ["admin", "hr"],
    });
    const { noteId } = result.params!;
    const profileNote = await EmployeeProfileNote.findById(noteId);

    if (!profileNote) throw new NotFoundError("Note");

    const employee = await Employee.findById(profileNote.employee)
      .select("employeeId")
      .lean();
    if (!employee) throw new NotFoundError("Employee");

    await profileNote.deleteOne();

    revalidateEmployeeNoteViews(employee.employeeId);
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

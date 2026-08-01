"use server";

import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

import action from "@/lib/handler/action-helper";
import handleError from "@/lib/handler/error";
import { requireEmployeeRecord } from "@/lib/handler/require-employee";
import { ForbiddenError, NotFoundError } from "@/lib/http-errors";
import { emailHrAboutNewConcern } from "@/lib/services/concern-email.service";
import ConcernAttachment from "@/models/concern-attachment.model";
import ConcernNote from "@/models/concern-note.model";
import Concern from "@/models/concern.model";
import Counter from "@/models/counter.model";
import Employee from "@/models/employee.model";
import Notification from "@/models/notification.model";
import User from "@/models/user.model";
import type { ActionResponse } from "@/types/global";
import {
  concernIdSchema,
  concernInternalNoteSchema,
  createConcernSchema,
  type ConcernInternalNoteInput,
  type CreateConcernInput,
} from "@/validations/concern.schema";

type HrRecipient = {
  _id: mongoose.Types.ObjectId;
  email: string;
};

function revalidateConcernViews(): void {
  ["/", "/employee-concerns", "/employee/concerns"].forEach((path) =>
    revalidatePath(path)
  );
}

async function getHrRecipients(): Promise<HrRecipient[]> {
  return User.find({
    role: { $in: ["admin", "hr"] },
    isActive: true,
  })
    .select("_id email")
    .lean<HrRecipient[]>();
}

async function nextConcernCaseNumber(): Promise<string> {
  const counter = await Counter.findByIdAndUpdate(
    "employee-concerns",
    { $inc: { sequence: 1 } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return `CON-${new Date().getFullYear()}-${String(counter.sequence).padStart(5, "0")}`;
}

async function getEmployeeIdentity(employeeId: string): Promise<{
  email: string;
  name: string;
}> {
  const employee = await Employee.findById(employeeId)
    .populate("userId", "email")
    .select("firstName middleName lastName userId")
    .lean();

  if (!employee) throw new NotFoundError("Employee");

  return {
    email:
      (employee.userId as unknown as { email?: string })?.email ?? "",
    name: [employee.firstName, employee.middleName, employee.lastName]
      .filter(Boolean)
      .join(" "),
  };
}

async function getAccessibleConcern({
  concernId,
  role,
  userId,
}: {
  concernId: string;
  role: "admin" | "hr" | "employee";
  userId: string;
}) {
  const concern = await Concern.findById(concernId);

  if (!concern) throw new NotFoundError("Concern");

  if (role === "employee") {
    const employee = await requireEmployeeRecord(userId);

    if (concern.employee.toString() !== employee.employeeDatabaseId) {
      throw new ForbiddenError(
        "You can only access concerns submitted from your account."
      );
    }
  }

  return concern;
}

export async function createOwnConcern(
  params: CreateConcernInput
): Promise<ActionResponse<{ id: string; caseNumber: string }>> {
  try {
    const result = await action({
      params,
      schema: createConcernSchema,
      roles: ["employee"],
    });
    const values = result.params!;
    const { session } = result;
    const employee = await requireEmployeeRecord(session.user.id);
    const [caseNumber, hrRecipients, identity] = await Promise.all([
      nextConcernCaseNumber(),
      getHrRecipients(),
      getEmployeeIdentity(employee.employeeDatabaseId),
    ]);
    const concern = await Concern.create({
      caseNumber,
      employee: employee.employeeDatabaseId,
      submittedBy: session.user.id,
      subject: values.subject,
      message: values.message,
      category: values.category,
      attachmentCount: values.attachments.length,
      isViewed: false,
    });

    await Promise.all([
      values.attachments.length
        ? ConcernAttachment.insertMany(
            values.attachments.map((attachment) => ({
              ...attachment,
              concern: concern._id,
              uploadedBy: session.user.id,
            }))
          )
        : Promise.resolve(),
      hrRecipients.length
        ? Notification.insertMany(
            hrRecipients.map((recipient) => ({
              recipient: recipient._id,
              type: "Concern Submitted" as const,
              title: `New concern from ${identity.name}`,
              description: `${caseNumber}: ${values.subject}`,
              href: `/employee-concerns/${concern._id.toString()}`,
              entityType: "Concern" as const,
              entityId: concern._id,
            }))
          )
        : Promise.resolve(),
    ]);

    await emailHrAboutNewConcern({
      caseNumber,
      category: values.category,
      employeeName: identity.name,
      recipients: hrRecipients,
      subject: values.subject,
    });

    revalidateConcernViews();
    return {
      success: true,
      data: { id: concern._id.toString(), caseNumber },
    };
  } catch (error) {
    return handleError(error);
  }
}

export async function markConcernOpened(params: {
  concernId: string;
}): Promise<ActionResponse<null>> {
  try {
    const result = await action({
      params,
      schema: concernIdSchema,
      roles: ["admin", "hr", "employee"],
    });
    const values = result.params!;
    const { session } = result;
    const concern = await getAccessibleConcern({
      concernId: values.concernId,
      role: session.user.role,
      userId: session.user.id,
    });

    await Notification.updateMany(
      {
        recipient: session.user.id,
        entityType: "Concern",
        entityId: concern._id,
        isRead: false,
      },
      { $set: { isRead: true } }
    );

    if (session.user.role !== "employee" && !concern.isViewed) {
      await Concern.updateOne(
        { _id: concern._id, isViewed: { $ne: true } },
        { $set: { isViewed: true, viewedAt: new Date() } }
      );
    }

    revalidateConcernViews();
    revalidatePath(`/employee-concerns/${values.concernId}`);
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

export async function addConcernInternalNote(
  params: ConcernInternalNoteInput
): Promise<ActionResponse<null>> {
  try {
    const result = await action({
      params,
      schema: concernInternalNoteSchema,
      roles: ["admin", "hr"],
    });
    const values = result.params!;
    const { session } = result;
    const concern = await getAccessibleConcern({
      concernId: values.concernId,
      role: session.user.role,
      userId: session.user.id,
    });
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + values.durationDays);

    await ConcernNote.create({
      concern: concern._id,
      author: session.user.id,
      body: values.note,
      expiresAt,
    });

    revalidatePath(`/employee-concerns/${values.concernId}`);
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

"use server";

import mongoose, { type ClientSession } from "mongoose";
import { revalidatePath } from "next/cache";

import { inferConcernPriority } from "@/constants/concerns";
import connectToDatabase from "@/database/mongodb";
import action from "@/lib/handler/action-helper";
import handleError from "@/lib/handler/error";
import { requireEmployeeRecord } from "@/lib/handler/require-employee";
import { ConflictError, ForbiddenError, NotFoundError } from "@/lib/http-errors";
import {
  emailEmployeeAboutConcernUpdate,
  emailHrAboutNewConcern,
} from "@/lib/services/concern-email.service";
import ConcernAttachment from "@/models/concern-attachment.model";
import ConcernAuditLog from "@/models/concern-audit-log.model";
import ConcernNote from "@/models/concern-note.model";
import ConcernStatusHistory from "@/models/concern-status-history.model";
import Concern from "@/models/concern.model";
import Counter from "@/models/counter.model";
import Employee from "@/models/employee.model";
import Notification from "@/models/notification.model";
import User from "@/models/user.model";
import type { ActionResponse } from "@/types/global";
import {
  concernIdSchema,
  concernInternalNoteSchema,
  concernPriorityUpdateSchema,
  concernStatusUpdateSchema,
  createConcernSchema,
  type ConcernInternalNoteInput,
  type ConcernPriorityUpdateInput,
  type ConcernStatusUpdateInput,
  type CreateConcernInput,
} from "@/validations/concern.schema";

type HrRecipient = {
  _id: mongoose.Types.ObjectId;
  email: string;
};

function revalidateConcernViews(): void {
  [
    "/",
    "/employee-concerns",
    "/employee",
    "/employee/concerns",
    "/employee/notifications",
  ].forEach((path) => revalidatePath(path));
}

function isTransactionUnsupported(error: unknown): boolean {
  return (
    error instanceof Error &&
    /Transaction numbers are only allowed|does not support transactions/i.test(
      error.message
    )
  );
}

async function runConcernTransaction<T>(
  operation: (session?: ClientSession) => Promise<T>
): Promise<T> {
  await connectToDatabase();
  const session = await mongoose.startSession();

  try {
    let result: T | undefined;

    await session.withTransaction(async () => {
      result = await operation(session);
    });

    return result as T;
  } catch (error) {
    if (isTransactionUnsupported(error)) {
      return operation();
    }

    throw error;
  } finally {
    await session.endSession();
  }
}

function sessionOption(session?: ClientSession): { session?: ClientSession } {
  return session ? { session } : {};
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

async function assertConcernAccess({
  concernId,
  role,
  userId,
}: {
  concernId: string;
  role: "admin" | "hr" | "employee";
  userId: string;
}) {
  const concern = await Concern.findById(concernId);

  if (!concern) {
    throw new NotFoundError("Concern");
  }

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

async function employeeIdentity(employeeId: string): Promise<{
  email: string;
  name: string;
}> {
  const employee = await Employee.findById(employeeId)
    .populate("userId", "email")
    .select("firstName middleName lastName userId")
    .lean();

  if (!employee) {
    throw new NotFoundError("Employee");
  }

  const user = employee.userId as unknown as { email?: string };

  return {
    email: user.email ?? "",
    name: [employee.firstName, employee.middleName, employee.lastName]
      .filter(Boolean)
      .join(" "),
  };
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
      employeeIdentity(employee.employeeDatabaseId),
    ]);
    const now = new Date();
    const priority = inferConcernPriority(values);

    const concernId = await runConcernTransaction(async (databaseSession) => {
      const [concern] = await Concern.create(
        [
          {
            caseNumber,
            employee: employee.employeeDatabaseId,
            submittedBy: session.user.id,
            subject: values.subject,
            message: values.message,
            category: values.category,
            priority,
            status: "New",
            attachmentCount: values.attachments.length,
            lastActivityAt: now,
          },
        ],
        sessionOption(databaseSession)
      );

      if (values.attachments.length) {
        await ConcernAttachment.insertMany(
          values.attachments.map((attachment) => ({
            ...attachment,
            concern: concern._id,
            uploadedBy: session.user.id,
          })),
          sessionOption(databaseSession)
        );
      }

      await Promise.all([
        ConcernStatusHistory.create(
          [
            {
              concern: concern._id,
              to: "New",
              changedBy: session.user.id,
              reason: "Concern submitted",
            },
          ],
          sessionOption(databaseSession)
        ),
        ConcernAuditLog.create(
          [
            {
              concern: concern._id,
              actor: session.user.id,
              action: "created",
              details: { category: values.category, priority },
            },
          ],
          sessionOption(databaseSession)
        ),
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
              })),
              sessionOption(databaseSession)
            )
          : Promise.resolve(),
      ]);

      return concern._id.toString();
    });

    await emailHrAboutNewConcern({
      caseNumber,
      category: values.category,
      employeeName: identity.name,
      recipients: hrRecipients,
      subject: values.subject,
    });

    revalidateConcernViews();
    return { success: true, data: { id: concernId, caseNumber } };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateConcernStatus(
  params: ConcernStatusUpdateInput
): Promise<ActionResponse<null>> {
  try {
    const result = await action({
      params,
      schema: concernStatusUpdateSchema,
      roles: ["admin", "hr"],
    });
    const values = result.params!;
    const { session } = result;
    const concern = await assertConcernAccess({
      concernId: values.concernId,
      role: session.user.role,
      userId: session.user.id,
    });

    if (concern.isArchived) {
      throw new ConflictError("Archived concerns cannot be changed.");
    }
    if (concern.status === values.status) {
      throw new ConflictError(`Concern is already ${values.status}.`);
    }

    const previousStatus = concern.status;
    const now = new Date();
    const setValues: Record<string, unknown> = {
      status: values.status,
      lastActivityAt: now,
    };
    const unsetValues: Record<string, ""> = {};

    if (values.status === "Resolved") setValues.resolvedAt = now;
    if (values.status === "Closed") setValues.closedAt = now;
    if (previousStatus === "Resolved" && values.status !== "Closed") {
      unsetValues.resolvedAt = "";
    }
    if (previousStatus === "Closed" && values.status !== "Closed") {
      unsetValues.closedAt = "";
    }

    await runConcernTransaction(async (databaseSession) => {
      await Promise.all([
        Concern.updateOne(
          { _id: concern._id },
          {
            $set: setValues,
            ...(Object.keys(unsetValues).length
              ? { $unset: unsetValues }
              : {}),
          },
          sessionOption(databaseSession)
        ),
        ConcernStatusHistory.create(
          [
            {
              concern: concern._id,
              from: previousStatus,
              to: values.status,
              changedBy: session.user.id,
              reason: values.reason,
            },
          ],
          sessionOption(databaseSession)
        ),
        ConcernAuditLog.create(
          [
            {
              concern: concern._id,
              actor: session.user.id,
              action: "status_changed",
              details: { from: previousStatus, to: values.status },
            },
          ],
          sessionOption(databaseSession)
        ),
        Notification.create(
          [
            {
              recipient: concern.submittedBy,
              type:
                values.status === "Resolved"
                  ? "Concern Resolved"
                  : "Concern Status Changed",
              title:
                values.status === "Resolved"
                  ? `Concern resolved · ${concern.caseNumber}`
                  : `Status updated · ${concern.caseNumber}`,
              description: `Your concern is now ${values.status}.`,
              href: `/employee/concerns/${concern._id.toString()}`,
              entityType: "Concern",
              entityId: concern._id,
            },
          ],
          sessionOption(databaseSession)
        ),
      ]);
    });

    const identity = await employeeIdentity(concern.employee.toString());

    if (identity.email) {
      await emailEmployeeAboutConcernUpdate({
        caseNumber: concern.caseNumber,
        employeeEmail: identity.email,
        idempotencyKey: `concern-status-${concern._id.toString()}-${values.status}-${now.getTime()}`,
        status: values.status,
        subject: concern.subject,
        update:
          values.status === "Resolved"
            ? "HR marked your concern as resolved."
            : "HR updated the status of your concern.",
      });
    }

    revalidateConcernViews();
    revalidatePath(`/employee-concerns/${values.concernId}`);
    revalidatePath(`/employee/concerns/${values.concernId}`);
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

export async function updateConcernPriority(
  params: ConcernPriorityUpdateInput
): Promise<ActionResponse<null>> {
  try {
    const result = await action({
      params,
      schema: concernPriorityUpdateSchema,
      roles: ["admin", "hr"],
    });
    const values = result.params!;
    const { session } = result;
    const concern = await assertConcernAccess({
      concernId: values.concernId,
      role: session.user.role,
      userId: session.user.id,
    });

    if (concern.isArchived) {
      throw new ConflictError("Archived concerns cannot be changed.");
    }
    if (concern.priority === values.priority) {
      return { success: true, data: null };
    }

    await Promise.all([
      Concern.updateOne(
        { _id: concern._id },
        { $set: { priority: values.priority, lastActivityAt: new Date() } }
      ),
      ConcernAuditLog.create({
        concern: concern._id,
        actor: session.user.id,
        action: "priority_changed",
        details: { from: concern.priority, to: values.priority },
      }),
    ]);

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
    const concern = await assertConcernAccess({
      concernId: values.concernId,
      role: session.user.role,
      userId: session.user.id,
    });

    if (concern.isArchived) {
      throw new ConflictError("Archived concerns cannot be changed.");
    }

    await Promise.all([
      ConcernNote.create({
        concern: concern._id,
        author: session.user.id,
        body: values.note,
      }),
      ConcernAuditLog.create({
        concern: concern._id,
        actor: session.user.id,
        action: "note_added",
      }),
    ]);

    revalidatePath(`/employee-concerns/${values.concernId}`);
    return { success: true, data: null };
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
    const concern = await assertConcernAccess({
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

    if (session.user.role !== "employee" && concern.status === "New") {
      const now = new Date();
      const statusUpdate = await Concern.updateOne(
        { _id: concern._id, status: "New" },
        { $set: { status: "Viewed", viewedAt: now } }
      );

      if (statusUpdate.modifiedCount === 1) {
        await Promise.all([
          ConcernStatusHistory.create({
            concern: concern._id,
            from: "New",
            to: "Viewed",
            changedBy: session.user.id,
            reason: "Opened by HR",
          }),
          ConcernAuditLog.create({
            concern: concern._id,
            actor: session.user.id,
            action: "viewed",
          }),
          Notification.create({
            recipient: concern.submittedBy,
            type: "Concern Status Changed",
            title: `Concern viewed · ${concern.caseNumber}`,
            description: "HR has reviewed your concern.",
            href: `/employee/concerns/${concern._id.toString()}`,
            entityType: "Concern",
            entityId: concern._id,
          }),
        ]);
      }
    }

    revalidateConcernViews();
    revalidatePath(`/employee-concerns/${values.concernId}`);
    revalidatePath(`/employee/concerns/${values.concernId}`);
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

export async function archiveConcern(params: {
  concernId: string;
}): Promise<ActionResponse<null>> {
  try {
    const result = await action({
      params,
      schema: concernIdSchema,
      roles: ["admin", "hr"],
    });
    const values = result.params!;
    const { session } = result;
    const concern = await assertConcernAccess({
      concernId: values.concernId,
      role: session.user.role,
      userId: session.user.id,
    });

    if (concern.isArchived) {
      throw new ConflictError("Concern is already archived.");
    }
    if (concern.status !== "Closed") {
      throw new ConflictError("Close the concern before archiving it.");
    }

    const now = new Date();
    await Promise.all([
      Concern.updateOne(
        { _id: concern._id },
        {
          $set: {
            isArchived: true,
            archivedAt: now,
            archivedBy: session.user.id,
          },
        }
      ),
      ConcernAuditLog.create({
        concern: concern._id,
        actor: session.user.id,
        action: "archived",
      }),
    ]);

    revalidateConcernViews();
    revalidatePath(`/employee-concerns/${values.concernId}`);
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

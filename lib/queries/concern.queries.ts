import "server-only";

import { Types } from "mongoose";

import connectToDatabase from "@/database/mongodb";
import ConcernAttachment from "@/models/concern-attachment.model";
import ConcernNote from "@/models/concern-note.model";
import Concern from "@/models/concern.model";
import Department from "@/models/department.model";
import Notification from "@/models/notification.model";
import Position from "@/models/position.model";
import User from "@/models/user.model";
import { serialiseDate } from "@/lib/serialization";
import type {
  ConcernDashboardAlerts,
  ConcernDetail,
  ConcernListItem,
  ConcernListResult,
} from "@/types/concerns";
import type { FilterValues } from "@/types/filters";

void Department;
void Position;
void User;

const PAGE_SIZE = 10;

function safePage(value?: string): number {
  return Math.max(Number(value) || 1, 1);
}

function fullName(employee: {
  firstName?: string;
  middleName?: string;
  lastName?: string;
}): string {
  return [employee.firstName, employee.middleName, employee.lastName]
    .filter(Boolean)
    .join(" ");
}

type PopulatedEmployee = {
  userId?: { email?: string };
  employeeId: string;
  firstName?: string;
  middleName?: string;
  lastName?: string;
  avatar?: string;
  department?: { name?: string };
  position?: { name?: string };
};

type PopulatedConcern = {
  _id: Types.ObjectId;
  caseNumber: string;
  employee?: PopulatedEmployee;
  subject: string;
  message: string;
  category: ConcernListItem["category"];
  attachmentCount: number;
  isViewed: boolean;
  viewedAt?: Date;
  createdAt: Date;
};

const concernPopulation = {
  path: "employee",
  select:
    "userId employeeId firstName middleName lastName avatar department position",
  populate: [
    { path: "userId", select: "email" },
    { path: "department", select: "name" },
    { path: "position", select: "name" },
  ],
};

function toListItem(concern: PopulatedConcern): ConcernListItem | null {
  const employee = concern.employee;

  if (!employee) return null;

  return {
    id: concern._id.toString(),
    caseNumber: concern.caseNumber,
    employee: fullName(employee),
    employeeId: employee.employeeId,
    avatar: employee.avatar,
    department: employee.department?.name ?? "Unassigned",
    subject: concern.subject,
    message: concern.message,
    category: concern.category,
    submittedAt: serialiseDate(concern.createdAt),
    attachmentCount: concern.attachmentCount,
    isNew: !concern.isViewed,
  };
}

export async function getHrConcernDashboard(
  filters: FilterValues
): Promise<ConcernListResult> {
  await connectToDatabase();

  const page = safePage(filters.page);
  const [entries, total] = await Promise.all([
    Concern.find({})
      .populate(concernPopulation)
      .sort({ isViewed: 1, createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Concern.countDocuments(),
  ]);

  return {
    concerns: entries
      .map((entry) => toListItem(entry as unknown as PopulatedConcern))
      .filter((entry): entry is ConcernListItem => Boolean(entry)),
    page,
    totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
    total,
  };
}

export async function getEmployeeConcernList(
  employeeId: string,
  filters: FilterValues
): Promise<ConcernListResult> {
  await connectToDatabase();

  const page = safePage(filters.page);
  const query = { employee: employeeId };
  const [entries, total] = await Promise.all([
    Concern.find(query)
      .populate(concernPopulation)
      .sort({ createdAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Concern.countDocuments(query),
  ]);

  return {
    concerns: entries
      .map((entry) => toListItem(entry as unknown as PopulatedConcern))
      .filter((entry): entry is ConcernListItem => Boolean(entry)),
    page,
    totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
    total,
  };
}

export async function getConcernDetail({
  employeeId,
  idOrCaseNumber,
  role,
}: {
  employeeId?: string;
  idOrCaseNumber: string;
  role: "admin" | "hr" | "employee";
}): Promise<ConcernDetail | null> {
  await connectToDatabase();

  const selector = Types.ObjectId.isValid(idOrCaseNumber)
    ? { _id: idOrCaseNumber }
    : { caseNumber: idOrCaseNumber.toUpperCase() };
  const query: Record<string, unknown> = { ...selector };

  if (role === "employee") {
    if (!employeeId) return null;
    query.employee = employeeId;
  }

  const concern = await Concern.findOne(query)
    .populate(concernPopulation)
    .lean();

  if (!concern) return null;

  const populatedConcern = concern as unknown as PopulatedConcern;
  const listItem = toListItem(populatedConcern);
  const employee = populatedConcern.employee;

  if (!listItem || !employee) return null;

  const [attachments, notes] = await Promise.all([
    ConcernAttachment.find({ concern: populatedConcern._id })
      .select("name mimeType size")
      .sort({ createdAt: 1 })
      .lean(),
    role === "employee"
      ? Promise.resolve([])
      : ConcernNote.find({
          concern: populatedConcern._id,
          $or: [
            { expiresAt: { $gt: new Date() } },
            { expiresAt: { $exists: false } },
          ],
        })
          .populate("author", "email")
          .sort({ createdAt: -1 })
          .lean(),
  ]);

  return {
    ...listItem,
    employeeEmail: employee.userId?.email ?? "",
    employeePosition: employee.position?.name ?? "Unassigned",
    viewedAt: serialiseDate(populatedConcern.viewedAt),
    attachments: attachments.map((attachment) => ({
      id: attachment._id.toString(),
      name: attachment.name,
      mimeType: attachment.mimeType,
      size: attachment.size,
    })),
    notes: notes.map((note) => ({
      id: note._id.toString(),
      author:
        (note.author as unknown as { email?: string })?.email ?? "HR team",
      body: note.body,
      createdAt: serialiseDate(note.createdAt),
      expiresAt: serialiseDate(note.expiresAt),
    })),
  };
}

export async function getConcernUnreadCount(userId: string): Promise<number> {
  await connectToDatabase();

  return Notification.countDocuments({
    recipient: userId,
    isRead: false,
    type: "Concern Submitted",
  });
}

export async function getConcernDashboardAlerts(
  userId: string
): Promise<ConcernDashboardAlerts> {
  await connectToDatabase();

  const [unread, notifications] = await Promise.all([
    getConcernUnreadCount(userId),
    Notification.find({
      recipient: userId,
      isRead: false,
      type: "Concern Submitted",
      entityType: "Concern",
      entityId: { $exists: true },
    })
      .select("entityId")
      .sort({ createdAt: -1 })
      .limit(5)
      .lean(),
  ]);
  const concernIds = notifications
    .map((notification) => notification.entityId?.toString())
    .filter((id): id is string => Boolean(id));

  if (!concernIds.length) return { unread, concerns: [] };

  const concerns = await Concern.find({ _id: { $in: concernIds } })
    .populate(concernPopulation)
    .lean();
  const byId = new Map(
    concerns.map((concern) => [
      concern._id.toString(),
      concern as unknown as PopulatedConcern,
    ])
  );

  return {
    unread,
    concerns: concernIds.flatMap((id) => {
      const concern = byId.get(id);
      const employee = concern?.employee;

      if (!concern || !employee) return [];

      return [
        {
          id,
          caseNumber: concern.caseNumber,
          subject: concern.subject,
          employee: fullName(employee),
        },
      ];
    }),
  };
}

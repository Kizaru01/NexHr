import "server-only";

import { Types } from "mongoose";

import connectToDatabase from "@/database/mongodb";
import ConcernAttachment from "@/models/concern-attachment.model";
import ConcernNote from "@/models/concern-note.model";
import ConcernStatusHistory from "@/models/concern-status-history.model";
import Concern from "@/models/concern.model";
import Department from "@/models/department.model";
import Employee from "@/models/employee.model";
import Notification from "@/models/notification.model";
import Position from "@/models/position.model";
import User from "@/models/user.model";
import { serialiseDate } from "@/lib/serialization";
import type {
  ConcernDashboardAlerts,
  ConcernDetail,
  ConcernListItem,
  EmployeeConcernListResult,
  HrConcernDashboardResult,
} from "@/types/concerns";
import type { FilterValues } from "@/types/filters";

void Department;
void Position;
void User;

const PAGE_SIZE = 10;
const CONCERN_NOTIFICATION_TYPES = [
  "Concern Submitted",
  "Concern Status Changed",
  "Concern Resolved",
] as const;

function safePage(value?: string): number {
  return Math.max(Number(value) || 1, 1);
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
  _id: Types.ObjectId;
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
  subject: ConcernListItem["subject"];
  message: string;
  category: ConcernListItem["category"];
  status: ConcernListItem["status"];
  priority: ConcernListItem["priority"];
  createdAt: Date;
  updatedAt: Date;
  lastActivityAt: Date;
  attachmentCount: number;
  isArchived: boolean;
  viewedAt?: Date;
  resolvedAt?: Date;
  closedAt?: Date;
};

function toListItem(concern: PopulatedConcern): ConcernListItem | null {
  const employee = concern.employee;

  if (!employee) {
    return null;
  }

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
    status: concern.status,
    priority: concern.priority,
    submittedAt: serialiseDate(concern.createdAt),
    updatedAt: serialiseDate(concern.updatedAt),
    lastActivityAt: serialiseDate(concern.lastActivityAt),
    attachmentCount: concern.attachmentCount,
  };
}

const concernPopulation = [
  {
    path: "employee",
    select:
      "userId employeeId firstName middleName lastName avatar department position",
    populate: [
      { path: "userId", select: "email" },
      { path: "department", select: "name" },
      { path: "position", select: "name" },
    ],
  },
];

async function employeeIdsForDepartment(
  department?: string
): Promise<Types.ObjectId[] | undefined> {
  if (!department) return undefined;

  if (!Types.ObjectId.isValid(department)) {
    return [];
  }

  return Employee.distinct("_id", { department });
}

async function employeeIdsForSearch(search: string): Promise<Types.ObjectId[]> {
  const expression = new RegExp(escapeRegExp(search), "i");
  const matchingUsers = await User.distinct("_id", { email: expression });

  return Employee.distinct("_id", {
    $or: [
      { firstName: expression },
      { middleName: expression },
      { lastName: expression },
      { employeeId: expression },
      { userId: { $in: matchingUsers } },
    ],
  });
}

export async function getHrConcernDashboard(
  filters: FilterValues
): Promise<HrConcernDashboardResult> {
  await connectToDatabase();

  const page = safePage(filters.page);
  const baseQuery: Record<string, unknown> = { isArchived: false };
  const departmentEmployeeIds = await employeeIdsForDepartment(
    filters.department
  );

  if (departmentEmployeeIds) {
    baseQuery.employee = { $in: departmentEmployeeIds };
  }

  const recordQuery: Record<string, unknown> = { ...baseQuery };
  const search = filters.search?.trim();

  if (search) {
    const expression = new RegExp(escapeRegExp(search), "i");
    const matchingEmployeeIds = await employeeIdsForSearch(search);
    recordQuery.$or = [
      { caseNumber: expression },
      { subject: expression },
      { message: expression },
      { category: expression },
      { employee: { $in: matchingEmployeeIds } },
    ];
  }
  if (filters.status) recordQuery.status = filters.status;
  if (filters.category) recordQuery.category = filters.category;
  if (filters.priority) recordQuery.priority = filters.priority;

  let sort: Record<string, 1 | -1> = { lastActivityAt: -1 };

  if (filters.sort === "submitted-asc") {
    sort = { createdAt: 1 };
  } else if (filters.sort === "submitted-desc") {
    sort = { createdAt: -1 };
  }

  const [entries, total, statusCounts] = await Promise.all([
    Concern.find(recordQuery)
      .populate(concernPopulation)
      .sort(sort)
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Concern.countDocuments(recordQuery),
    Concern.aggregate<{ _id: string; count: number }>([
      { $match: baseQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);
  const counts = Object.fromEntries(
    statusCounts.map((record) => [record._id, record.count])
  );
  const inProgress = (counts.Viewed ?? 0) + (counts["In Progress"] ?? 0);

  return {
    concerns: entries
      .map((entry) => toListItem(entry as unknown as PopulatedConcern))
      .filter((entry): entry is ConcernListItem => Boolean(entry)),
    stats: {
      total: Object.values(counts).reduce(
        (totalCount, count) => totalCount + count,
        0
      ),
      new: counts.New ?? 0,
      inProgress,
      resolved: counts.Resolved ?? 0,
      closed: counts.Closed ?? 0,
    },
    page,
    totalPages: Math.max(Math.ceil(total / PAGE_SIZE), 1),
    total,
  };
}

export async function getEmployeeConcernList(
  employeeId: string,
  filters: FilterValues
): Promise<EmployeeConcernListResult> {
  await connectToDatabase();

  const page = safePage(filters.page);
  const baseQuery = { employee: employeeId, isArchived: false };
  const recordQuery: Record<string, unknown> = { ...baseQuery };
  const search = filters.search?.trim();

  if (search) {
    const expression = new RegExp(escapeRegExp(search), "i");
    recordQuery.$or = [
      { caseNumber: expression },
      { subject: expression },
      { message: expression },
      { category: expression },
    ];
  }
  if (filters.status) recordQuery.status = filters.status;

  const [entries, total, statusCounts] = await Promise.all([
    Concern.find(recordQuery)
      .populate(concernPopulation)
      .sort({ lastActivityAt: -1 })
      .skip((page - 1) * PAGE_SIZE)
      .limit(PAGE_SIZE)
      .lean(),
    Concern.countDocuments(recordQuery),
    Concern.aggregate<{ _id: string; count: number }>([
      { $match: baseQuery },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);
  const counts = Object.fromEntries(
    statusCounts.map((record) => [record._id, record.count])
  );
  return {
    concerns: entries
      .map((entry) => toListItem(entry as unknown as PopulatedConcern))
      .filter((entry): entry is ConcernListItem => Boolean(entry)),
    stats: {
      total: Object.values(counts).reduce(
        (totalCount, count) => totalCount + count,
        0
      ),
      inReview: (counts.New ?? 0) + (counts.Viewed ?? 0),
      inProgress: counts["In Progress"] ?? 0,
      resolved: counts.Resolved ?? 0,
    },
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
  const concernQuery: Record<string, unknown> = { ...selector };

  if (role === "employee") {
    if (!employeeId) return null;
    concernQuery.employee = employeeId;
  }

  const concern = await Concern.findOne(concernQuery)
    .populate(concernPopulation)
    .lean();

  if (!concern) return null;

  const populatedConcern = concern as unknown as PopulatedConcern;
  const listItem = toListItem(populatedConcern);
  const employee = populatedConcern.employee;

  if (!listItem || !employee) return null;

  const [attachments, notes, history] = await Promise.all([
    ConcernAttachment.find({ concern: populatedConcern._id })
      .select("name mimeType size")
      .sort({ createdAt: 1 })
      .lean(),
    role === "employee"
      ? Promise.resolve([])
      : ConcernNote.find({ concern: populatedConcern._id })
          .populate("author", "email")
          .sort({ createdAt: -1 })
          .lean(),
    ConcernStatusHistory.find({ concern: populatedConcern._id })
      .populate("changedBy", "email")
      .sort({ createdAt: 1 })
      .lean(),
  ]);

  return {
    ...listItem,
    employeeEmail: employee.userId?.email ?? "",
    employeePosition: employee.position?.name ?? "Unassigned",
    isArchived: populatedConcern.isArchived,
    viewedAt: serialiseDate(populatedConcern.viewedAt),
    resolvedAt: serialiseDate(populatedConcern.resolvedAt),
    closedAt: serialiseDate(populatedConcern.closedAt),
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
    })),
    history: history.map((entry) => ({
      id: entry._id.toString(),
      from: entry.from,
      to: entry.to,
      changedBy:
        (entry.changedBy as unknown as { email?: string })?.email ??
        "System",
      reason: entry.reason,
      createdAt: serialiseDate(entry.createdAt),
    })),
  };
}

export async function getConcernUnreadCount(userId: string): Promise<number> {
  await connectToDatabase();

  return Notification.countDocuments({
    recipient: userId,
    isRead: false,
    type: { $in: CONCERN_NOTIFICATION_TYPES },
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
      type: { $in: CONCERN_NOTIFICATION_TYPES },
      entityType: "Concern",
      entityId: { $exists: true },
    })
      .select("entityId")
      .sort({ createdAt: -1 })
      .limit(12)
      .lean(),
  ]);
  const concernIds = Array.from(
    new Set(
      notifications
        .map((notification) => notification.entityId?.toString())
        .filter((id): id is string => Boolean(id))
    )
  ).slice(0, 5);

  if (!concernIds.length) {
    return { unread, concerns: [] };
  }

  const concerns = await Concern.find({
    _id: { $in: concernIds },
    isArchived: false,
  })
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
          priority: concern.priority,
          status: concern.status,
          createdAt: serialiseDate(concern.createdAt),
        },
      ];
    }),
  };
}

import "server-only";

import { Types } from "mongoose";

import connectToDatabase from "@/database/mongodb";
import Announcement from "@/models/announcement.model";
import type {
  AnnouncementDashboardResult,
  EditableAnnouncement,
} from "@/types/hr-dashboard";
import {
  DEFAULT_PAGE_SIZE,
  safePage,
  serialiseDate,
  type ListFilters,
  type SortDefinition,
} from "./hr-dashboard.shared";

const categories = ["Company", "People", "Policy", "Benefits", "Events"] as const;
const priorities = ["Low", "Normal", "High"] as const;
const sorts: Record<string, SortDefinition> = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  "title-asc": { title: 1 },
  "title-desc": { title: -1 },
};

export async function getAnnouncementDashboard(
  filters: ListFilters
): Promise<AnnouncementDashboardResult> {
  const {
    category,
    page: pageFilter,
    priority,
    search: searchFilter,
    sort: sortFilter,
    state,
  } = filters;

  await connectToDatabase();

  const page = safePage(pageFilter);
  const query: Record<string, unknown> = {};
  const search = searchFilter?.trim();

  if (search) {
    query.$or = ["title", "description"].map((field) => ({
      [field]: { $regex: search, $options: "i" },
    }));
  }

  if (categories.includes(category as (typeof categories)[number])) {
    query.category = category;
  }

  if (priorities.includes(priority as (typeof priorities)[number])) {
    query.priority = priority;
  }

  if (state === "published") {
    query.isPublished = true;
    query.isArchived = { $ne: true };
  }
  if (state === "draft") {
    query.isPublished = false;
    query.isArchived = { $ne: true };
  }
  if (state === "archived") query.isArchived = true;

  const sort = sorts[sortFilter ?? ""] ?? sorts.newest;
  const [announcements, total, published, drafts, highPriority] = await Promise.all([
    Announcement.find(query)
      .select("title description category priority publishedAt isPublished isArchived archivedAt createdAt")
      .sort(sort)
      .skip((page - 1) * DEFAULT_PAGE_SIZE)
      .limit(DEFAULT_PAGE_SIZE)
      .lean(),
    Announcement.countDocuments(query),
    Announcement.countDocuments({ isPublished: true, isArchived: { $ne: true } }),
    Announcement.countDocuments({ isPublished: false, isArchived: { $ne: true } }),
    Announcement.countDocuments({
      isPublished: true,
      isArchived: { $ne: true },
      priority: "High",
    }),
  ]);

  return {
    announcements: announcements.map((announcement) => ({
      id: announcement._id.toString(),
      title: announcement.title,
      description: announcement.description,
      category: announcement.category,
      priority: announcement.priority,
      state: announcement.isArchived
        ? "Archived"
        : announcement.isPublished
          ? "Published"
          : "Draft",
      isPublished: announcement.isPublished,
      isArchived: announcement.isArchived,
      publishedAt: announcement.isPublished && !announcement.isArchived
        ? serialiseDate(announcement.publishedAt)
        : null,
      createdAt: serialiseDate(announcement.createdAt),
    })),
    stats: { published, drafts, highPriority },
    page,
    totalPages: Math.max(Math.ceil(total / DEFAULT_PAGE_SIZE), 1),
    total,
  };
}

export async function getAnnouncementForEditing(
  announcementId: string
): Promise<EditableAnnouncement | null> {
  if (!Types.ObjectId.isValid(announcementId)) {
    return null;
  }

  await connectToDatabase();

  const announcement = await Announcement.findOne({
    _id: announcementId,
    isArchived: { $ne: true },
  })
    .select("title description category priority isPublished")
    .lean();

  if (!announcement) {
    return null;
  }

  return {
    id: announcement._id.toString(),
    title: announcement.title,
    description: announcement.description,
    category: announcement.category,
    priority: announcement.priority,
    isPublished: announcement.isPublished,
  };
}

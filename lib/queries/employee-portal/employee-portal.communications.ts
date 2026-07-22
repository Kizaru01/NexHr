import "server-only";

import { Types } from "mongoose";

import Announcement from "@/models/announcement.model";
import Notification from "@/models/notification.model";
import type {
  EmployeeAnnouncementDetail,
  EmployeeAnnouncementsResult,
  EmployeeNotificationsResult,
} from "@/types/employee-portal";
import {
  EMPLOYEE_PORTAL_PAGE_SIZE,
  safePage,
  serialiseDate,
  type EmployeePortalFilters,
} from "./employee-portal.shared";

const announcementCategories = ["Company", "People", "Policy", "Benefits", "Events"] as const;

export async function getEmployeeAnnouncements(
  filters: EmployeePortalFilters
): Promise<EmployeeAnnouncementsResult> {
  const { category, page: pageFilter, search: searchFilter } = filters;
  const page = safePage(pageFilter);
  const query: Record<string, unknown> = {
    isPublished: true,
    isArchived: { $ne: true },
  };
  const search = searchFilter?.trim();

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (
    category &&
    announcementCategories.includes(category as never)
  ) {
    query.category = category;
  }

  const [announcements, total, highPriority] = await Promise.all([
    Announcement.find(query)
      .select("title description category priority publishedAt")
      .sort({ publishedAt: -1 })
      .skip((page - 1) * EMPLOYEE_PORTAL_PAGE_SIZE)
      .limit(EMPLOYEE_PORTAL_PAGE_SIZE)
      .lean(),
    Announcement.countDocuments(query),
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
      publishedAt: serialiseDate(announcement.publishedAt),
    })),
    stats: { total, highPriority },
    page,
    total,
    totalPages: Math.max(Math.ceil(total / EMPLOYEE_PORTAL_PAGE_SIZE), 1),
  };
}

export async function getEmployeeAnnouncementDetail(
  announcementId: string
): Promise<EmployeeAnnouncementDetail | null> {
  if (!Types.ObjectId.isValid(announcementId)) {
    return null;
  }

  const announcement = await Announcement.findOne({
    _id: announcementId,
    isPublished: true,
    isArchived: { $ne: true },
  })
    .select("title description category priority publishedAt createdAt")
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
    publishedAt: serialiseDate(announcement.publishedAt),
    createdAt: serialiseDate(announcement.createdAt),
  };
}

export async function getEmployeeNotifications(
  userId: string
): Promise<EmployeeNotificationsResult> {
  const [notifications, unread] = await Promise.all([
    Notification.find({ recipient: userId })
      .select("type title description href isRead createdAt")
      .sort({ createdAt: -1 })
      .limit(50)
      .lean(),
    Notification.countDocuments({ recipient: userId, isRead: false }),
  ]);

  return {
    unread,
    total: notifications.length,
    notifications: notifications.map((notification) => ({
      id: notification._id.toString(),
      type: notification.type,
      title: notification.title,
      description: notification.description,
      href: notification.href,
      isRead: notification.isRead,
      createdAt: serialiseDate(notification.createdAt),
    })),
  };
}

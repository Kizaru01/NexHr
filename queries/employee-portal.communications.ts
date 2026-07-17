import "server-only";

import Announcement from "@/models/announcement.model";
import Notification from "@/models/notification.model";
import {
  EMPLOYEE_PORTAL_PAGE_SIZE,
  safePage,
  serialiseDate,
  type EmployeePortalFilters,
} from "./employee-portal.shared";

const announcementCategories = ["Company", "People", "Policy", "Benefits", "Events"] as const;

export async function getEmployeeAnnouncements(filters: EmployeePortalFilters) {
  const page = safePage(filters.page);
  const query: Record<string, unknown> = { isPublished: true };
  const search = filters.search?.trim();

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }
  if (
    filters.category &&
    announcementCategories.includes(filters.category as never)
  ) {
    query.category = filters.category;
  }

  const [announcements, total, highPriority] = await Promise.all([
    Announcement.find(query)
      .select("title description category priority publishedAt")
      .sort({ publishedAt: -1 })
      .skip((page - 1) * EMPLOYEE_PORTAL_PAGE_SIZE)
      .limit(EMPLOYEE_PORTAL_PAGE_SIZE)
      .lean(),
    Announcement.countDocuments(query),
    Announcement.countDocuments({ isPublished: true, priority: "High" }),
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

export async function getEmployeeNotifications(userId: string) {
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

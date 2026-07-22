"use server";

import { revalidatePath } from "next/cache";

import Announcement from "@/models/announcement.model";
import Notification from "@/models/notification.model";
import User from "@/models/user.model";
import type { ActionResponse, ErrorResponse } from "@/types/global";
import {
  createAnnouncementSchema,
  archiveAnnouncementSchema,
  deleteAnnouncementSchema,
  type CreateAnnouncementInput,
  updateAnnouncementSchema,
  type UpdateAnnouncementInput,
} from "@/validations/announcement.schema";
import action from "../handler/action-helper";
import handleError from "../handler/error";
import { ConflictError, NotFoundError } from "../http-errors";

function revalidateAnnouncementViews(): void {
  revalidatePath("/announcements");
  revalidatePath("/employee");
  revalidatePath("/employee/announcements");
  revalidatePath("/employee/notifications");
}

async function notifyEmployeesOfAnnouncement({
  id,
  title,
  category,
}: {
  id: string;
  title: string;
  category: string;
}): Promise<void> {
  const recipients = await User.find({
    role: "employee",
    isActive: true,
    "notification.announcements": { $ne: false },
  })
    .select("_id")
    .lean();

  if (!recipients.length) {
    return;
  }

  await Notification.insertMany(
    recipients.map((recipient) => ({
      recipient: recipient._id,
      type: "New Announcement" as const,
      title: `New announcement: ${title}`,
      description: `A new ${category.toLowerCase()} announcement is available.`,
      href: `/employee/announcements/${id}`,
    }))
  );
}

export async function createAnnouncement(
  params: CreateAnnouncementInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const result = await action({
      params,
      schema: createAnnouncementSchema,
      roles: ["admin", "hr"],
    });
    const announcement = await Announcement.create(result.params!);
    const { _id, category, isPublished, title } = announcement;
    const announcementId = _id.toString();

    if (isPublished) {
      await notifyEmployeesOfAnnouncement({
        id: announcementId,
        title,
        category,
      });
    }

    revalidateAnnouncementViews();

    return { success: true, data: { id: announcementId } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function updateAnnouncement(
  params: UpdateAnnouncementInput
): Promise<ActionResponse<{ id: string }>> {
  try {
    const result = await action({
      params,
      schema: updateAnnouncementSchema,
      roles: ["admin", "hr"],
    });
    const { id, ...announcementParams } = result.params!;
    const { category, description, isPublished, priority, title } =
      announcementParams;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      throw new NotFoundError("Announcement");
    }
    if (announcement.isArchived) {
      throw new ConflictError("Archived announcements cannot be edited.");
    }

    const announcementId = announcement._id.toString();
    const isBeingPublished = !announcement.isPublished && isPublished;
    announcement.title = title;
    announcement.description = description;
    announcement.category = category;
    announcement.priority = priority;
    announcement.isPublished = isPublished;
    if (isBeingPublished) {
      announcement.publishedAt = new Date();
    }
    await announcement.save();

    if (isBeingPublished) {
      await notifyEmployeesOfAnnouncement({
        id: announcementId,
        title,
        category,
      });
    }

    revalidateAnnouncementViews();
    return { success: true, data: { id: announcementId } };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function archiveAnnouncement(params: {
  id: string;
}): Promise<ActionResponse> {
  try {
    const result = await action({
      params,
      schema: archiveAnnouncementSchema,
      roles: ["admin", "hr"],
    });
    const { id } = result.params!;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      throw new NotFoundError("Announcement");
    }
    if (announcement.isArchived) {
      throw new ConflictError("Announcement is already archived.");
    }

    announcement.isArchived = true;
    announcement.archivedAt = new Date();
    await announcement.save();

    revalidateAnnouncementViews();
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

export async function deleteAnnouncement(params: {
  id: string;
}): Promise<ActionResponse> {
  try {
    const result = await action({
      params,
      schema: deleteAnnouncementSchema,
      roles: ["admin", "hr"],
    });
    const { id } = result.params!;
    const announcement = await Announcement.findById(id);

    if (!announcement) {
      throw new NotFoundError("Announcement");
    }
    const { _id, isArchived, isPublished } = announcement;
    if (isPublished && !isArchived) {
      throw new ConflictError(
        "Published announcements must be archived before deletion."
      );
    }

    await Announcement.deleteOne({ _id });

    revalidateAnnouncementViews();
    return { success: true };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

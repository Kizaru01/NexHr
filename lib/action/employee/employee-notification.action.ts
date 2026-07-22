"use server";

import { revalidatePath } from "next/cache";

import action from "@/lib/handler/action-helper";
import handleError from "@/lib/handler/error";
import { NotFoundError } from "@/lib/http-errors";
import Notification from "@/models/notification.model";
import type { ActionResponse } from "@/types/global";
import { markNotificationReadSchema } from "@/validations/employee-portal.schema";

export async function markOwnNotificationRead(params: {
  notificationId: string;
}): Promise<ActionResponse<null>> {
  try {
    const validated = await action({
      params,
      schema: markNotificationReadSchema,
      roles: ["employee"],
    });
    const { params: validatedParams, session } = validated;
    const { notificationId } = validatedParams!;
    const notification = await Notification.findOne({
      _id: notificationId,
      recipient: session.user.id,
    });

    if (!notification) {
      throw new NotFoundError("Notification");
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    revalidatePath("/employee");
    revalidatePath("/employee/notifications");
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

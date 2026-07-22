"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Bell, Check } from "lucide-react";
import { toast } from "sonner";

import { markOwnNotificationRead } from "@/lib/action/employee/employee-notification.action";
import { Button } from "@/components/ui/button";
import type { EmployeeNotification } from "@/types/employee-portal";

type NotificationListProps = {
  notifications: EmployeeNotification[];
};

export default function NotificationList({
  notifications,
}: NotificationListProps): React.JSX.Element {
  const router = useRouter();
  const [items, setItems] = useState(notifications);
  const [isPending, startTransition] = useTransition();

  function markAsRead(notificationId: string, href?: string): void {
    startTransition(async () => {
      const result = await markOwnNotificationRead({ notificationId });

      if (!result.success) {
        toast.error(result.error?.message ?? "Unable to update notification.");
        return;
      }

      setItems((currentItems) =>
        currentItems.map((notification) =>
          notification.id === notificationId
            ? { ...notification, isRead: true }
            : notification
        )
      );

      if (href) {
        router.push(href);
      }
    });
  }

  return (
    <div className="space-y-2">
      {items.map((notification) => {
        const {
          id,
          type,
          title,
          description,
          href,
          isRead,
          createdAt,
        } = notification;
        const containerClassName = isRead
          ? "bg-background"
          : "border-primary/30 bg-primary/5";
        const displayedCreatedAt = createdAt
          ? new Date(createdAt).toLocaleString()
          : "—";

        let notificationAction: React.ReactNode = null;

        if (!isRead) {
          notificationAction = (
            <Button
              variant="ghost"
              size="sm"
              disabled={isPending}
              onClick={() => markAsRead(id, href)}
            >
              <Check /> {href ? "Open update" : "Mark as read"}
            </Button>
          );
        } else if (href) {
          notificationAction = (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(href)}
            >
              Open update
            </Button>
          );
        }

        return (
          <div
            key={id}
            className={`rounded-lg border p-4 transition-colors ${containerClassName}`}
          >
            <div className="flex gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Bell className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{title}</p>
                  {!isRead ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                      Unread
                    </span>
                  ) : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {description}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">
                    {type} · {displayedCreatedAt}
                  </p>
                  {notificationAction}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BellRing, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updateNotificationPreferences } from "@/lib/action/employee-portal.action";
import { notificationPreferencesSchema } from "@/validations/employee-portal.schema";

type PreferenceValues = z.infer<typeof notificationPreferencesSchema>;

const preferenceLabels: Array<{ key: keyof PreferenceValues; title: string; description: string }> = [
  { key: "leave", title: "Leave updates", description: "Approvals, rejections, and request changes." },
  { key: "attendance", title: "Attendance updates", description: "Attendance correction decisions and reminders." },
  { key: "announcements", title: "Company announcements", description: "Published company, policy, and people updates." },
  { key: "payroll", title: "Payroll updates", description: "Payslip availability and payroll notices." },
  { key: "email", title: "Email delivery", description: "Also send eligible notifications to your work email." },
];

export default function NotificationPreferencesForm({
  preferences,
}: {
  preferences: PreferenceValues;
}) {
  const router = useRouter();
  const form = useForm<PreferenceValues>({
    resolver: zodResolver(notificationPreferencesSchema),
    defaultValues: preferences,
  });

  async function onSubmit(values: PreferenceValues) {
    const response = await updateNotificationPreferences(values);
    if (!response.success) {
      toast.error(response.error?.message ?? "Unable to save notification preferences.");
      return;
    }

    toast.success("Notification preferences updated.");
    form.reset(values);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><BellRing className="size-4" /> Notification preferences</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-1">
          {preferenceLabels.map((preference) => (
            <label key={preference.key} className="flex cursor-pointer gap-3 rounded-lg p-3 hover:bg-muted/60">
              <input
                type="checkbox"
                className="mt-1 size-4 accent-primary"
                {...form.register(preference.key)}
              />
              <span>
                <span className="block font-medium">{preference.title}</span>
                <span className="text-sm text-muted-foreground">{preference.description}</span>
              </span>
            </label>
          ))}
          <div className="flex justify-end pt-3">
            <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
              {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
              Save preferences
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

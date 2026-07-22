"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Save, Send } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import {
  createAnnouncement,
  updateAnnouncement,
} from "@/lib/action/announcement.action";
import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { CreateAnnouncementInput } from "@/validations/announcement.schema";
import { createAnnouncementSchema } from "@/validations/announcement.schema";

type AnnouncementFormValues = z.input<typeof createAnnouncementSchema>;

type EditableAnnouncement = AnnouncementFormValues & { id: string };

type AnnouncementFormProps = {
  announcement?: EditableAnnouncement;
};

const categories = [
  "Company",
  "People",
  "Policy",
  "Benefits",
  "Events",
] as const;
const priorities = ["Low", "Normal", "High"] as const;

const defaultValues: AnnouncementFormValues = {
  title: "",
  description: "",
  category: "Company",
  priority: "Normal",
  isPublished: true,
};

export default function AnnouncementForm({
  announcement,
}: AnnouncementFormProps): React.JSX.Element {
  const router = useRouter();
  const initialValues: AnnouncementFormValues = announcement
    ? {
        title: announcement.title,
        description: announcement.description,
        category: announcement.category,
        priority: announcement.priority,
        isPublished: announcement.isPublished,
      }
    : defaultValues;
  const form = useForm<
    AnnouncementFormValues,
    undefined,
    CreateAnnouncementInput
  >({
    resolver: zodResolver(createAnnouncementSchema),
    defaultValues: initialValues,
  });
  const { errors, isSubmitting } = form.formState;

  async function submit(values: CreateAnnouncementInput): Promise<void> {
    const result = announcement
      ? await updateAnnouncement({ id: announcement.id, ...values })
      : await createAnnouncement(values);

    if (!result.success) {
      toast.error(
        result.error?.message ??
          `Unable to ${announcement ? "update" : "create"} announcement.`
      );
      return;
    }

    toast.success(
      announcement
        ? "Announcement updated."
        : values.isPublished
          ? "Announcement published."
          : "Announcement saved as a draft."
    );
    form.reset(initialValues);
    router.push("/announcements");
  }

  return (
    <form onSubmit={form.handleSubmit(submit)} className="space-y-6">
      <Field data-invalid={Boolean(errors.title)}>
        <FieldLabel htmlFor="announcement-title">Title</FieldLabel>
        <Input
          id="announcement-title"
          placeholder="Share an important update"
          aria-invalid={Boolean(errors.title)}
          {...form.register("title")}
        />
        <FieldError errors={[errors.title]} />
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field data-invalid={Boolean(errors.category)}>
          <FieldLabel>Category</FieldLabel>
          <Controller
            control={form.control}
            name="category"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  aria-invalid={Boolean(errors.category)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.category]} />
        </Field>

        <Field data-invalid={Boolean(errors.priority)}>
          <FieldLabel>Priority</FieldLabel>
          <Controller
            control={form.control}
            name="priority"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger
                  aria-invalid={Boolean(errors.priority)}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {priorities.map((priority) => (
                    <SelectItem key={priority} value={priority}>
                      {priority}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.priority]} />
        </Field>
      </div>

      <Field data-invalid={Boolean(errors.description)}>
        <FieldLabel htmlFor="announcement-description">Message</FieldLabel>
        <Textarea
          id="announcement-description"
          placeholder="Write the announcement employees should receive."
          className="min-h-48"
          aria-invalid={Boolean(errors.description)}
          {...form.register("description")}
        />
        <FieldError errors={[errors.description]} />
      </Field>

      <Field
        orientation="horizontal"
        className="items-start rounded-lg border p-4"
      >
        <input
          id="announcement-published"
          type="checkbox"
          className="mt-1 size-4 accent-primary"
          {...form.register("isPublished")}
        />
        <div>
          <FieldLabel htmlFor="announcement-published">
            Publish immediately
          </FieldLabel>
          <FieldDescription>
            Published announcements become visible in the employee portal. Clear
            this to save a draft.
          </FieldDescription>
        </div>
      </Field>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => form.reset(initialValues)}
          disabled={isSubmitting}
        >
          <Save /> Reset
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Send />{" "}
          {isSubmitting
            ? "Saving..."
            : announcement
              ? "Save changes"
              : "Create announcement"}
        </Button>
      </div>
    </form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { updateOwnProfileImage } from "@/lib/action/employee-portal.action";
import { profileImageSchema } from "@/validations/employee-portal.schema";

const supportedImageTypes = ["image/jpeg", "image/png", "image/webp"];
const maxImageSize = 2_000_000;
type ImageValues = z.infer<typeof profileImageSchema>;

function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("The image could not be read."));
    reader.readAsDataURL(file);
  });
}

export default function ProfileImageForm({
  avatar,
  name,
}: {
  avatar?: string;
  name: string;
}) {
  const router = useRouter();
  const form = useForm<ImageValues>({
    resolver: zodResolver(profileImageSchema),
    defaultValues: { avatar: avatar ?? "" },
  });
  const image = useWatch({ control: form.control, name: "avatar" });
  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2);

  async function onFileChange(file?: File) {
    if (!file) return;
    if (!supportedImageTypes.includes(file.type)) {
      form.setError("avatar", { message: "Use a JPG, PNG, or WebP image." });
      return;
    }
    if (file.size > maxImageSize) {
      form.setError("avatar", { message: "Profile image must be 2 MB or smaller." });
      return;
    }

    try {
      const dataUrl = await readFile(file);
      form.setValue("avatar", dataUrl, { shouldDirty: true, shouldValidate: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to read image.");
    }
  }

  async function onSubmit(values: ImageValues) {
    const response = await updateOwnProfileImage(values);
    if (!response.success) {
      toast.error(response.error?.message ?? "Unable to update your profile image.");
      return;
    }

    toast.success("Profile image updated.");
    form.reset(values);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-4">
      <Avatar className="size-16" size="lg">
        {image ? <AvatarImage src={image} alt={`${name} profile`} /> : null}
        <AvatarFallback>{initials || "ME"}</AvatarFallback>
      </Avatar>
      <div className="min-w-0 space-y-1">
        <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-primary">
          <Camera className="size-4" /> Choose image
          <input
            className="sr-only"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(event) => onFileChange(event.target.files?.[0])}
          />
        </label>
        <p className="text-xs text-muted-foreground">JPG, PNG, or WebP up to 2 MB.</p>
        {form.formState.errors.avatar ? (
          <p className="text-xs text-destructive">{form.formState.errors.avatar.message}</p>
        ) : null}
        {form.formState.isDirty ? (
          <Button type="submit" size="sm" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : null}
            Save photo
          </Button>
        ) : null}
      </div>
    </form>
  );
}

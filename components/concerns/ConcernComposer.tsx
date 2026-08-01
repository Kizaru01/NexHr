"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { LockKeyhole, Send } from "lucide-react";
import { toast } from "sonner";

import AttachmentPicker from "@/components/concerns/AttachmentPicker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  CONCERN_CATEGORIES,
  type ConcernCategory,
} from "@/constants/concerns";
import { createOwnConcern } from "@/lib/action/concern.action";
import type { ConcernAttachmentInput } from "@/validations/concern.schema";

export default function ConcernComposer(): React.JSX.Element {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState<ConcernCategory | "">("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<ConcernAttachmentInput[]>([]);

  function submitConcern(event: React.FormEvent<HTMLFormElement>): void {
    event.preventDefault();

    if (!category) {
      toast.error("Choose a category for your concern.");
      return;
    }

    startTransition(async () => {
      const result = await createOwnConcern({
        subject,
        category,
        message,
        attachments,
      });

      if (!result.success) {
        toast.error("Concern could not be submitted", {
          description: result.error.message,
        });
        return;
      }

      toast.success("Concern submitted", {
        description: `${result.data.caseNumber} is now in the HR queue.`,
      });
      router.push(`/employee/concerns/${result.data.id}`);
      router.refresh();
    });
  }

  return (
    <form className="space-y-5" onSubmit={submitConcern}>
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="concern-subject">Subject</Label>
          <Input
            id="concern-subject"
            value={subject}
            minLength={5}
            maxLength={140}
            required
            disabled={isPending}
            placeholder="A short summary of what you need help with"
            onChange={(event) => setSubject(event.target.value)}
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor="concern-category">Category</Label>
          <Select
            value={category}
            disabled={isPending}
            onValueChange={(value) => setCategory(value as ConcernCategory)}
          >
            <SelectTrigger id="concern-category" className="w-full">
              <SelectValue placeholder="Choose the closest category" />
            </SelectTrigger>
            <SelectContent>
              {CONCERN_CATEGORIES.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2 sm:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="concern-message">Your concern letter</Label>
            <span className="text-xs text-muted-foreground">
              {message.length}/5,000
            </span>
          </div>
          <Textarea
            id="concern-message"
            value={message}
            minLength={20}
            maxLength={5_000}
            required
            disabled={isPending}
            className="min-h-36 resize-y"
            placeholder="Include the relevant dates, context, and what outcome would help. Avoid including passwords or banking credentials."
            onChange={(event) => setMessage(event.target.value)}
          />
        </div>
      </div>

      <AttachmentPicker
        attachments={attachments}
        disabled={isPending}
        onChange={setAttachments}
      />

      <div className="rounded-lg border border-primary/15 bg-primary-soft p-3.5">
        <div className="flex gap-3">
          <LockKeyhole className="mt-0.5 size-4 shrink-0 text-primary" />
          <div>
            <p className="text-xs font-semibold">Private HR channel</p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Only you and authorized HR or admin staff can access this
              letter.
            </p>
          </div>
        </div>
      </div>

      <Button type="submit" className="w-full sm:w-auto" disabled={isPending}>
        <Send />
        {isPending ? "Submitting securely…" : "Submit concern"}
      </Button>
    </form>
  );
}

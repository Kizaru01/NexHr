"use client";

import { useRef, useState } from "react";

import { FileText, Paperclip, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { ConcernAttachmentInput } from "@/validations/concern.schema";

type AttachmentPickerProps = {
  attachments: ConcernAttachmentInput[];
  disabled?: boolean;
  onChange: (attachments: ConcernAttachmentInput[]) => void;
};

const acceptedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
];

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

function formatSize(size: number): string {
  return size < 1_000_000
    ? `${Math.ceil(size / 1_000)} KB`
    : `${(size / 1_000_000).toFixed(1)} MB`;
}

export default function AttachmentPicker({
  attachments,
  disabled,
  onChange,
}: AttachmentPickerProps): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isReading, setIsReading] = useState(false);

  async function addFiles(files: FileList | null): Promise<void> {
    if (!files?.length) return;

    const availableSlots = 3 - attachments.length;
    const selected = Array.from(files).slice(0, availableSlots);

    if (files.length > availableSlots) {
      toast.error("Up to 3 attachments are allowed.");
    }
    if (
      selected.some(
        (file) => !acceptedTypes.includes(file.type) || file.size > 2_000_000
      )
    ) {
      toast.error("Choose PDF, image, or text files up to 2 MB each.");
      if (inputRef.current) inputRef.current.value = "";
      return;
    }

    setIsReading(true);
    try {
      const next = await Promise.all(
        selected.map(async (file) => ({
          name: file.name,
          mimeType: file.type as ConcernAttachmentInput["mimeType"],
          size: file.size,
          data: await readAsDataUrl(file),
        }))
      );
      const combinedSize = [...attachments, ...next].reduce(
        (total, attachment) => total + attachment.size,
        0
      );

      if (combinedSize > 5_000_000) {
        toast.error("Combined attachments cannot exceed 5 MB.");
        return;
      }

      onChange([...attachments, ...next]);
    } catch {
      toast.error("One of the selected files could not be read.");
    } finally {
      setIsReading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={acceptedTypes.join(",")}
        className="sr-only"
        disabled={disabled || isReading || attachments.length >= 3}
        onChange={(event) => void addFiles(event.target.files)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled || isReading || attachments.length >= 3}
          onClick={() => inputRef.current?.click()}
        >
          <Paperclip />
          {isReading ? "Preparing files…" : "Add attachments"}
        </Button>
        <span className="text-xs text-muted-foreground">
          PDF, PNG, JPG, WebP, or TXT · 2 MB each
        </span>
      </div>

      {attachments.length ? (
        <ul className="grid gap-2 sm:grid-cols-2">
          {attachments.map((attachment, index) => (
            <li
              key={`${attachment.name}-${index}`}
              className="flex items-center gap-2 rounded-lg border bg-muted/35 p-2.5"
            >
              <FileText className="size-4 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-medium">
                  {attachment.name}
                </p>
                <p className="text-[0.6875rem] text-muted-foreground">
                  {formatSize(attachment.size)}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                aria-label={`Remove ${attachment.name}`}
                disabled={disabled}
                onClick={() =>
                  onChange(
                    attachments.filter(
                      (_attachment, attachmentIndex) =>
                        attachmentIndex !== index
                    )
                  )
                }
              >
                <X />
              </Button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

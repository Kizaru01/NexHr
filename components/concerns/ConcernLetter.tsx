import { Download, FileText, Paperclip } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { ConcernAttachmentView } from "@/types/concerns";

function formatSize(size: number): string {
  return size < 1_000_000
    ? `${Math.ceil(size / 1_000)} KB`
    : `${(size / 1_000_000).toFixed(1)} MB`;
}

export default function ConcernLetter({
  attachments,
  message,
}: {
  attachments: ConcernAttachmentView[];
  message: string;
}): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="size-4 text-primary" />
          Concern letter
        </CardTitle>
        <CardDescription>
          The original message submitted by the employee
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="rounded-xl border bg-muted/25 p-5 text-sm leading-7 whitespace-pre-wrap">
          {message}
        </div>

        {attachments.length ? (
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold text-muted-foreground">
              <Paperclip className="size-3.5" />
              Attachments
            </p>
            <div className="grid gap-2 sm:grid-cols-2">
              {attachments.map((attachment) => (
                <a
                  key={attachment.id}
                  href={`/api/concern-attachments/${attachment.id}`}
                  className="flex items-center gap-2 rounded-lg border bg-card p-3 text-xs transition-colors hover:border-primary/30 hover:bg-primary-soft"
                >
                  <FileText className="size-4 shrink-0 text-primary" />
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {attachment.name}
                  </span>
                  <span className="text-muted-foreground">
                    {formatSize(attachment.size)}
                  </span>
                  <Download className="size-3.5" />
                </a>
              ))}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

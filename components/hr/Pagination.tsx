import Link from "next/link";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

type PaginationProps = {
  page: number;
  totalPages: number;
  parameters: Record<string, string | undefined>;
};

export default function Pagination({
  page,
  totalPages,
  parameters,
}: PaginationProps): React.JSX.Element | null {
  function getPageHref(nextPage: number): string {
    const pageParameters = {
      ...parameters,
      page: String(nextPage),
    };
    const searchParameters = new URLSearchParams(
      Object.entries(pageParameters).filter(([, value]) => value)
    );

    return `?${searchParameters}`;
  }

  if (totalPages < 2) return null;

  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;

  return (
    <div className="flex items-center justify-between border-t px-4 py-3">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          disabled={!hasPreviousPage}
          asChild={hasPreviousPage}
        >
          {hasPreviousPage ? (
            <Link href={getPageHref(page - 1)}>
              <ChevronLeft /> Previous
            </Link>
          ) : (
            <span>
              <ChevronLeft /> Previous
            </span>
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          disabled={!hasNextPage}
          asChild={hasNextPage}
        >
          {hasNextPage ? (
            <Link href={getPageHref(page + 1)}>
              Next <ChevronRight />
            </Link>
          ) : (
            <span>
              Next <ChevronRight />
            </span>
          )}
        </Button>
      </div>
    </div>
  );
}

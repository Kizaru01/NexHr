import type { ReactNode } from "react";

type Detail = { label: string; value: ReactNode };

export default function DetailList({ details }: { details: readonly Detail[] }): React.JSX.Element {
  return (
    <dl className="grid gap-x-8 gap-y-5 sm:grid-cols-2">
      {details.map((detail) => (
        <div key={detail.label}>
          <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            {detail.label}
          </dt>
          <dd className="mt-1 font-medium">{detail.value || "Not provided"}</dd>
        </div>
      ))}
    </dl>
  );
}

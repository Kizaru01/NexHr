"use client";

import PortalError from "@/components/employee-portal/PortalError";

export default function EmployeePortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return <PortalError error={error} reset={reset} />;
}

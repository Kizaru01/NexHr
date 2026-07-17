"use client";

import PortalError from "@/components/employee-portal/PortalError";

export default function EmployeePortalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return <PortalError error={error} reset={reset} />;
}

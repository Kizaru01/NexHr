"use client";

import { CircleCheck, LoaderCircle, Mail } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { resendEmployeeWelcomeEmail } from "@/lib/action/employee/employee.action";

type ResendWelcomeEmailButtonProps = {
  employeeId: string;
};

type DeliveryResult =
  | {
      status: "error" | "success";
      message: string;
    }
  | undefined;

export default function ResendWelcomeEmailButton({
  employeeId,
}: ResendWelcomeEmailButtonProps): React.JSX.Element {
  const [isPending, startTransition] = useTransition();
  const [deliveryResult, setDeliveryResult] = useState<DeliveryResult>();

  function resendWelcomeEmail(): void {
    setDeliveryResult(undefined);

    startTransition(async () => {
      try {
        const result = await resendEmployeeWelcomeEmail({ employeeId });

        if (!result.success) {
          setDeliveryResult({
            status: "error",
            message: result.error.message,
          });
          toast.error("Unable to resend welcome email", {
            description: result.error.message,
          });
          return;
        }

        setDeliveryResult({
          status: "success",
          message: "Welcome email sent successfully.",
        });
        toast.success("Welcome email sent successfully.");
      } catch {
        setDeliveryResult({
          status: "error",
          message: "The request could not be completed. Please try again.",
        });
        toast.error("Unable to resend welcome email", {
          description: "Please try again.",
        });
      }
    });
  }

  if (deliveryResult?.status === "success") {
    return (
      <p
        role="status"
        aria-live="polite"
        className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400"
      >
        <CircleCheck className="size-4" />
        {deliveryResult.message}
      </p>
    );
  }

  return (
    <div className="flex flex-col items-start gap-1.5">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={isPending}
        onClick={resendWelcomeEmail}
        aria-label={`Resend welcome email to employee ${employeeId}`}
      >
        {isPending ? (
          <LoaderCircle className="animate-spin" />
        ) : (
          <Mail />
        )}
        {isPending ? "Sending..." : "Resend email"}
      </Button>
      {deliveryResult?.status === "error" && (
        <p
          role="alert"
          aria-live="assertive"
          className="max-w-64 text-xs text-destructive"
        >
          {deliveryResult.message}
        </p>
      )}
    </div>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Field, FieldError, FieldLabel } from "../ui/field";
import { Input } from "../ui/input";
import { createEmployee } from "@/lib/action/employee/employee.action";
import { toast } from "sonner";
import { EmploymentInformation } from "./index";
import { createEmployeeSchema } from "@/validations/employee.schema";
import { useTransition, useState, useRef, useEffect } from "react";
import type {
  EmployeePositionSelectOption,
  EmployeeSelectOption,
} from "@/types/global";

export type EmployeeFormValues = z.infer<typeof createEmployeeSchema>;
export type EmployeeFormInput = z.input<typeof createEmployeeSchema>;
type EmployeeFormOutput = z.output<typeof createEmployeeSchema>;

type EmployeeFormProps = {
  departmentOptions: EmployeeSelectOption[];
  positionOptions: EmployeePositionSelectOption[];
};

const CREATE_EMPLOYEE_REQUEST_STORAGE_KEY =
  "hrmanagement:create-employee:request-id";

function createRequestId(): string {
  return globalThis.crypto.randomUUID();
}

function createDefaultValues(requestId: string): EmployeeFormInput {
  return {
    requestId,
    firstName: "",
    lastName: "",
    phone: "",
    email: "",
    department: "",
    position: "",
    hireDate: "",
    employmentType: "Probationary",
  };
}

export const EmployeeForm = ({
  departmentOptions,
  positionOptions,
}: EmployeeFormProps): React.JSX.Element => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [initialRequestId] = useState(createRequestId);
  const requestIdRef = useRef(initialRequestId);

  const form = useForm<EmployeeFormInput, undefined, EmployeeFormOutput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: createDefaultValues(initialRequestId),
  });

  useEffect(() => {
    const savedRequestId = window.sessionStorage.getItem(
      CREATE_EMPLOYEE_REQUEST_STORAGE_KEY
    );

    if (savedRequestId) {
      requestIdRef.current = savedRequestId;
    } else {
      window.sessionStorage.setItem(
        CREATE_EMPLOYEE_REQUEST_STORAGE_KEY,
        requestIdRef.current
      );
    }

    form.setValue("requestId", requestIdRef.current, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [form]);

  const onSubmit = (values: EmployeeFormValues) => {
    startTransition(async () => {
      try {
        const result = await createEmployee(values);

        if (!result.success) {
          toast.error("Failed to create employee", {
            description: result.error.message,
          });
          return;
        }

        window.sessionStorage.removeItem(CREATE_EMPLOYEE_REQUEST_STORAGE_KEY);
        if (result.warning) {
          toast.warning("Employee created with a warning", {
            description: result.warning.message,
          });
        } else {
          toast.success("Employee created successfully.");
        }
        router.push("/employees");
      } catch {
        toast.error("Unable to save employee. Please retry.");
      }
    });
  };

  const cancelEmployeeCreation = (): void => {
    window.sessionStorage.removeItem(CREATE_EMPLOYEE_REQUEST_STORAGE_KEY);
    router.back();
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">
                Employee and account information
              </h2>
              <p className="text-sm text-muted-foreground">
                Enter the employee&apos;s basic contact details. The activation
                email will be sent to their work email.
              </p>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  data-invalid={Boolean(form.formState.errors.firstName)}
                >
                  <FieldLabel htmlFor="firstName">First name</FieldLabel>
                  <Input
                    id="firstName"
                    aria-invalid={Boolean(form.formState.errors.firstName)}
                    {...form.register("firstName")}
                  />
                  <FieldError errors={[form.formState.errors.firstName]} />
                </Field>
                <Field
                  data-invalid={Boolean(form.formState.errors.lastName)}
                >
                  <FieldLabel htmlFor="lastName">Last name</FieldLabel>
                  <Input
                    id="lastName"
                    aria-invalid={Boolean(form.formState.errors.lastName)}
                    {...form.register("lastName")}
                  />
                  <FieldError errors={[form.formState.errors.lastName]} />
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.phone)}>
                  <FieldLabel htmlFor="phone">Contact number</FieldLabel>
                  <Input
                    id="phone"
                    type="tel"
                    aria-invalid={Boolean(form.formState.errors.phone)}
                    {...form.register("phone")}
                  />
                  <FieldError errors={[form.formState.errors.phone]} />
                </Field>
                <Field data-invalid={Boolean(form.formState.errors.email)}>
                  <FieldLabel htmlFor="email">Work email</FieldLabel>
                  <Input
                    id="email"
                    type="email"
                    aria-invalid={Boolean(form.formState.errors.email)}
                    {...form.register("email")}
                  />
                  <FieldError errors={[form.formState.errors.email]} />
                </Field>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <EmploymentInformation
              departmentOptions={departmentOptions}
              positionOptions={positionOptions}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={cancelEmployeeCreation}
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Employee"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

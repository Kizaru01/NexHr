"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import z from "zod";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { createEmployee } from "@/lib/action/employee.action";
import { toast } from "sonner";
import {
  PersonalInformation,
  EmploymentInformation,
  SalaryInformation,
  AddressInformation,
  EmergencyContact,
} from "./index";
import { createEmployeeSchema } from "@/validations/employee.schema";
import { useTransition, useState, useRef, useEffect } from "react";

export type EmployeeFormValues = z.infer<typeof createEmployeeSchema>;
type EmployeeFormInput = z.input<typeof createEmployeeSchema>;
type EmployeeFormOutput = z.output<typeof createEmployeeSchema>;
export type EmployeeSelectOption = {
  value: string;
  label: string;
};

export type EmployeePositionSelectOption = EmployeeSelectOption & {
  departmentId: string;
};

type EmployeeFormProps = {
  departmentOptions: EmployeeSelectOption[];
  positionOptions: EmployeePositionSelectOption[];
  managerOptions: EmployeeSelectOption[];
};

const DEFAULT_VALUES: Partial<EmployeeFormValues> = {
  employmentType: "Probationary",
  salary: { basic: 0, allowance: 0 },
};

const CREATE_EMPLOYEE_REQUEST_STORAGE_KEY =
  "hrmanagement:create-employee:request-id";

function createRequestId(): string {
  return globalThis.crypto.randomUUID();
}

export const EmployeeForm = ({
  departmentOptions,
  positionOptions,
  managerOptions,
}: EmployeeFormProps) => {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [initialRequestId] = useState(createRequestId);
  const requestIdRef = useRef(initialRequestId);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<EmployeeFormInput, any, EmployeeFormOutput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: {
      ...DEFAULT_VALUES,
      requestId: initialRequestId,
    },
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
          toast.error(result.error?.message ?? "Failed to create employee.");
          return;
        }

        window.sessionStorage.removeItem(CREATE_EMPLOYEE_REQUEST_STORAGE_KEY);
        toast.success("Employee created successfully.");
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
            <PersonalInformation />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <EmploymentInformation
              departmentOptions={departmentOptions}
              positionOptions={positionOptions}
              managerOptions={managerOptions}
            />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <SalaryInformation />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <AddressInformation />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <EmergencyContact />
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
            {isPending ? "Saving..." : "Save Employee"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

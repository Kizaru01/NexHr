"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
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
} from "../Infomartion";
import { createEmployeeSchema } from "@/validations/employee.schema";

export type EmployeeFormValues = z.infer<typeof createEmployeeSchema>;
type EmployeeFormInput = z.input<typeof createEmployeeSchema>;
type EmployeeFormOutput = z.output<typeof createEmployeeSchema>;
export type EmployeeSelectOption = {
  value: string;
  label: string;
};

type EmployeeFormProps = {
  departmentOptions: EmployeeSelectOption[];
  positionOptions: EmployeeSelectOption[];
  managerOptions: EmployeeSelectOption[];
};

const DEFAULT_VALUES: Partial<EmployeeFormValues> = {
  employmentType: "Probationary",
  salary: { basic: 0, allowance: 0 },
};

export default function EmployeeForm({
  departmentOptions,
  positionOptions,
  managerOptions,
}: EmployeeFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const form = useForm<EmployeeFormInput, any, EmployeeFormOutput>({
    resolver: zodResolver(createEmployeeSchema),
    defaultValues: DEFAULT_VALUES,
  });

  function onSubmit(values: EmployeeFormValues) {
    startTransition(async () => {
      const result = await createEmployee(values);

      if (!result.success) {
        toast.error(result.error?.message ?? "Failed to create employee.");
        return;
      }

      toast.success("Employee created successfully.");
      router.push("/employees");
    });
  }

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
            onClick={() => router.back()}
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
}

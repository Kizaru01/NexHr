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
const DEFAULT_VALUES: Partial<EmployeeFormValues> = {
  employmentType: "Probationary",
  salary: { basic: 0, allowance: 0 },
};

// type Option = { id: string; name: string };

// type EmployeeFormProps = {
//   /** Departments fetched server-side, rendered as a select instead of a raw ID input. */
//   departments?: Option[];
//   /** Positions fetched server-side, rendered as a select instead of a raw ID input. */
//   positions?: Option[];
//   /** Existing employees eligible to be selected as a manager. */
//   managers?: Option[];
// };

export default function EmployeeForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

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
            <EmploymentInformation />
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

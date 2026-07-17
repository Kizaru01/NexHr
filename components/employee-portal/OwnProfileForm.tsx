"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { updateOwnEmployeeProfile } from "@/lib/action/employee-portal.action";
import {
  ownEmployeeProfileFormSchema,
  type OwnEmployeeProfileInput,
} from "@/validations/employee-portal.schema";

type ProfileFormValues = z.infer<typeof ownEmployeeProfileFormSchema>;

type ProfileFormProps = {
  profile: {
    firstName: string;
    middleName?: string;
    lastName: string;
    email: string;
    phone?: string;
    birthDate: string | null;
    gender?: "Male" | "Female";
    address?: {
      street?: string;
      barangay?: string;
      city?: string;
      province?: string;
      postalCode?: string;
    };
    emergencyContact?: { name?: string; relationship?: string; phone?: string };
  };
};

function optional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export default function OwnProfileForm({ profile }: ProfileFormProps) {
  const router = useRouter();
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ownEmployeeProfileFormSchema),
    defaultValues: {
      firstName: profile.firstName,
      middleName: profile.middleName ?? "",
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone ?? "",
      birthDate: profile.birthDate?.slice(0, 10) ?? "",
      gender: profile.gender ?? "",
      address: {
        street: profile.address?.street ?? "",
        barangay: profile.address?.barangay ?? "",
        city: profile.address?.city ?? "",
        province: profile.address?.province ?? "",
        postalCode: profile.address?.postalCode ?? "",
      },
      emergencyContact: {
        name: profile.emergencyContact?.name ?? "",
        relationship: profile.emergencyContact?.relationship ?? "",
        phone: profile.emergencyContact?.phone ?? "",
      },
    },
  });
  const gender = useWatch({ control: form.control, name: "gender" });

  async function onSubmit(values: ProfileFormValues) {
    const payload: OwnEmployeeProfileInput = {
      firstName: values.firstName,
      middleName: optional(values.middleName),
      lastName: values.lastName,
      email: values.email,
      phone: optional(values.phone),
      birthDate: values.birthDate ? new Date(`${values.birthDate}T00:00:00`) : undefined,
      gender: values.gender || undefined,
      address: {
        street: optional(values.address.street),
        barangay: optional(values.address.barangay),
        city: optional(values.address.city),
        province: optional(values.address.province),
        postalCode: optional(values.address.postalCode),
      },
      emergencyContact: values.emergencyContact,
    };
    const response = await updateOwnEmployeeProfile(payload);

    if (!response.success) {
      toast.error(response.error?.message ?? "Unable to update your profile.");
      return;
    }

    toast.success("Your profile has been updated.");
    form.reset(values);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardHeader><CardTitle>Personal information</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(["firstName", "middleName", "lastName", "email", "phone", "birthDate"] as const).map(
            (field) => (
              <Field key={field} data-invalid={Boolean(form.formState.errors[field])}>
                <FieldLabel htmlFor={field}>{field.replace(/([A-Z])/g, " $1")}</FieldLabel>
                <Input
                  id={field}
                  type={field === "birthDate" ? "date" : field === "email" ? "email" : "text"}
                  {...form.register(field)}
                />
                <FieldError errors={[form.formState.errors[field]]} />
              </Field>
            )
          )}
          <Field data-invalid={Boolean(form.formState.errors.gender)}>
            <FieldLabel htmlFor="gender">Gender</FieldLabel>
            <Select
              value={gender}
              onValueChange={(value) => form.setValue("gender", value as ProfileFormValues["gender"], { shouldDirty: true })}
            >
              <SelectTrigger id="gender"><SelectValue placeholder="Prefer not to say" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={[form.formState.errors.gender]} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Address</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(["street", "barangay", "city", "province", "postalCode"] as const).map((field) => (
            <Field key={field} data-invalid={Boolean(form.formState.errors.address?.[field])}>
              <FieldLabel htmlFor={`address-${field}`}>{field.replace(/([A-Z])/g, " $1")}</FieldLabel>
              <Input id={`address-${field}`} {...form.register(`address.${field}`)} />
              <FieldError errors={[form.formState.errors.address?.[field]]} />
            </Field>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>Emergency contact</CardTitle></CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {(["name", "relationship", "phone"] as const).map((field) => (
            <Field key={field} data-invalid={Boolean(form.formState.errors.emergencyContact?.[field])}>
              <FieldLabel htmlFor={`emergency-${field}`}>{field}</FieldLabel>
              <Input id={`emergency-${field}`} {...form.register(`emergencyContact.${field}`)} />
              <FieldError errors={[form.formState.errors.emergencyContact?.[field]]} />
            </Field>
          ))}
        </CardContent>
      </Card>

      <div className="sticky bottom-3 z-10 flex justify-end rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur">
        <Button type="submit" disabled={!form.formState.isDirty || form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="animate-spin" /> : <Save />}
          Save changes
        </Button>
      </div>
    </form>
  );
}

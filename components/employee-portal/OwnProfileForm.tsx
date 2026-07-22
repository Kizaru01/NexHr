"use client";

import { useRouter } from "next/navigation";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

import { updateOwnEmployeeProfile } from "@/lib/action/employee/employee-portal.action";
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
import type { OwnProfileFormProfile } from "@/types/employee-portal";
import {
  ownEmployeeProfileFormSchema,
  type OwnEmployeeProfileInput,
} from "@/validations/employee-portal.schema";

type ProfileFormValues = z.infer<typeof ownEmployeeProfileFormSchema>;

type ProfileFormProps = {
  profile: OwnProfileFormProfile;
};

function optional(value?: string): string | undefined {
  const trimmed = value?.trim();
  return trimmed || undefined;
}

export default function OwnProfileForm({
  profile,
}: ProfileFormProps): React.JSX.Element {
  const router = useRouter();
  const {
    address = {},
    birthDate,
    email,
    emergencyContact = {},
    firstName,
    gender: profileGender,
    lastName,
    middleName,
    phone,
  } = profile;
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(ownEmployeeProfileFormSchema),
    defaultValues: {
      firstName,
      middleName: middleName ?? "",
      lastName,
      email,
      phone: phone ?? "",
      birthDate: birthDate?.slice(0, 10) ?? "",
      gender: profileGender ?? "",
      address: {
        street: address.street ?? "",
        barangay: address.barangay ?? "",
        city: address.city ?? "",
        province: address.province ?? "",
        postalCode: address.postalCode ?? "",
      },
      emergencyContact: {
        name: emergencyContact.name ?? "",
        relationship: emergencyContact.relationship ?? "",
        phone: emergencyContact.phone ?? "",
      },
    },
  });
  const { errors, isDirty, isSubmitting } = form.formState;
  const gender = useWatch({ control: form.control, name: "gender" });

  async function onSubmit(values: ProfileFormValues): Promise<void> {
    const {
      address: formAddress,
      birthDate: formBirthDate,
      email: formEmail,
      emergencyContact: formEmergencyContact,
      firstName: formFirstName,
      gender: formGender,
      lastName: formLastName,
      middleName: formMiddleName,
      phone: formPhone,
    } = values;
    const payload: OwnEmployeeProfileInput = {
      firstName: formFirstName,
      middleName: optional(formMiddleName),
      lastName: formLastName,
      email: formEmail,
      phone: optional(formPhone),
      birthDate: formBirthDate
        ? new Date(`${formBirthDate}T00:00:00`)
        : undefined,
      gender: formGender || undefined,
      address: {
        street: optional(formAddress.street),
        barangay: optional(formAddress.barangay),
        city: optional(formAddress.city),
        province: optional(formAddress.province),
        postalCode: optional(formAddress.postalCode),
      },
      emergencyContact: formEmergencyContact,
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
        <CardHeader>
          <CardTitle>Personal information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(
            [
              "firstName",
              "middleName",
              "lastName",
              "email",
              "phone",
              "birthDate",
            ] as const
          ).map((field) => (
            <Field
              key={field}
              data-invalid={Boolean(errors[field])}
            >
              <FieldLabel htmlFor={field}>
                {field.replace(/([A-Z])/g, " $1")}
              </FieldLabel>
              <Input
                id={field}
                type={
                  field === "birthDate"
                    ? "date"
                    : field === "email"
                      ? "email"
                      : "text"
                }
                {...form.register(field)}
              />
              <FieldError errors={[errors[field]]} />
            </Field>
          ))}
          <Field data-invalid={Boolean(errors.gender)}>
            <FieldLabel htmlFor="gender">Gender</FieldLabel>
            <Select
              value={gender}
              onValueChange={(value) =>
                form.setValue("gender", value as ProfileFormValues["gender"], {
                  shouldDirty: true,
                })
              }
            >
              <SelectTrigger id="gender">
                <SelectValue placeholder="Prefer not to say" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
            <FieldError errors={[errors.gender]} />
          </Field>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {(
            ["street", "barangay", "city", "province", "postalCode"] as const
          ).map((field) => (
            <Field
              key={field}
              data-invalid={Boolean(errors.address?.[field])}
            >
              <FieldLabel htmlFor={`address-${field}`}>
                {field.replace(/([A-Z])/g, " $1")}
              </FieldLabel>
              <Input
                id={`address-${field}`}
                {...form.register(`address.${field}`)}
              />
              <FieldError errors={[errors.address?.[field]]} />
            </Field>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Emergency contact</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          {(["name", "relationship", "phone"] as const).map((field) => (
            <Field
              key={field}
              data-invalid={Boolean(errors.emergencyContact?.[field])}
            >
              <FieldLabel htmlFor={`emergency-${field}`}>{field}</FieldLabel>
              <Input
                id={`emergency-${field}`}
                {...form.register(`emergencyContact.${field}`)}
              />
              <FieldError errors={[errors.emergencyContact?.[field]]} />
            </Field>
          ))}
        </CardContent>
      </Card>

      <div className="sticky bottom-3 z-10 flex justify-end rounded-xl border bg-background/95 p-3 shadow-sm backdrop-blur">
        <Button
          type="submit"
          disabled={!isDirty || isSubmitting}
        >
          {isSubmitting ? (
            <Loader2 className="animate-spin" />
          ) : (
            <Save />
          )}
          Save changes
        </Button>
      </div>
    </form>
  );
}

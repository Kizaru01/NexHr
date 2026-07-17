"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createUser } from "@/lib/action/user.action";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { registerUserSchema } from "@/validations/user.schema";

type RegisterUserFormValues = z.infer<typeof registerUserSchema>;

const EmailRegistration = () => {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterUserFormValues>({
    resolver: zodResolver(registerUserSchema),
    defaultValues: {
      email: "",
    },
  });
  const onSubmit = async (values: RegisterUserFormValues) => {
    const result = await createUser(values);

    if (!result.success) {
      toast.error("Failed", {
        description: result.error?.message ?? "Registration failed.",
      });

      return;
    }

    toast.success("Success", {
      description: "Email registered successfully.",
    });

    reset();

    router.push("/dashboard");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
      <FieldGroup>
        <Field data-invalid={!!errors.email}>
          <FieldLabel htmlFor="email">Email</FieldLabel>

          <Input
            id="email"
            type="email"
            placeholder="employee@company.com"
            autoComplete="email"
            {...register("email")}
          />

          <FieldDescription>
            We will use this email for your profile activation.
          </FieldDescription>

          <FieldError errors={errors.email ? [errors.email] : []} />
        </Field>
      </FieldGroup>

      <Button
        type="submit"
        className="w-full sm:w-auto"
        disabled={isSubmitting}
      >
        Register User
      </Button>
    </form>
  );
};

export default EmailRegistration;

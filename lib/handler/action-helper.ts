"use server";

import { auth } from "@/auth";
import connectToDatabase from "@/database/mongodb";

import { ZodError, ZodSchema } from "zod";

import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "../http-errors";

type UserRole = "admin" | "hr" | "employee";

type ActionOptions<T> = {
  params?: T;
  schema?: ZodSchema<T>;
  roles?: UserRole[];
};

export default async function action<T>({
  params,
  schema,
  roles,
}: ActionOptions<T>) {
  let validatedParams = params;

  if (schema && params) {
    try {
      validatedParams = schema.parse(params);
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(error.flatten().fieldErrors);
      }

      throw error;
    }
  }

  const session = await auth();

  if (!session?.user?.id) {
    throw new UnauthorizedError();
  }

  if (roles && !roles.includes(session.user.role)) {
    throw new ForbiddenError();
  }

  await connectToDatabase();

  return {
    params: validatedParams,
    session,
  };
}

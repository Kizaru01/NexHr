import "server-only";

import type { Session } from "next-auth";
import { ZodError, type ZodSchema } from "zod";

import { auth } from "@/auth";
import connectToDatabase from "@/database/mongodb";
import type { UserRole } from "@/types/global";
import { requireEmployeeRecord } from "@/lib/handler/require-employee";

import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "../http-errors";

type ActionOptions<T> = {
  params?: T;
  schema?: ZodSchema<T>;
  roles?: UserRole[];
  allowIncompleteEmployeeProfile?: boolean;
};

type ActionResult<T> = {
  params: T | undefined;
  session: Session;
};

export default async function action<T>({
  params,
  schema,
  roles,
  allowIncompleteEmployeeProfile = false,
}: ActionOptions<T>): Promise<ActionResult<T>> {
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

  if (!session.user.isActive) {
    throw new UnauthorizedError("Your account is inactive.");
  }

  if (roles && !roles.includes(session.user.role)) {
    throw new ForbiddenError();
  }

  await connectToDatabase();

  if (session.user.role === "employee") {
    await requireEmployeeRecord(session.user.id, {
      allowIncompleteProfile: allowIncompleteEmployeeProfile,
    });
  }

  return {
    params: validatedParams,
    session,
  };
}

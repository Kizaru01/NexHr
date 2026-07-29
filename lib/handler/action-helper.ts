import "server-only";

import type { Session } from "next-auth";
import { ZodError, type ZodSchema } from "zod";

import { auth } from "@/auth";
import type { UserRole } from "@/types/global";
import { requireEmployeeRecord } from "@/lib/handler/require-employee";
import { requireActiveDatabaseUser } from "@/lib/handler/require-active-user";

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
  session: VerifiedSession;
};

type VerifiedSession = Session & {
  user: Session["user"] & {
    id: string;
    role: UserRole;
    isActive: true;
  };
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

  const currentUser = await requireActiveDatabaseUser(session.user);

  if (roles && !roles.includes(currentUser.role)) {
    throw new ForbiddenError();
  }

  const verifiedSession: VerifiedSession = {
    ...session,
    user: {
      ...session.user,
      id: currentUser.id,
      role: currentUser.role,
      isActive: true,
    },
  };

  if (currentUser.role === "employee") {
    await requireEmployeeRecord(currentUser.id, {
      allowIncompleteProfile: allowIncompleteEmployeeProfile,
    });
  }

  return {
    params: validatedParams,
    session: verifiedSession,
  };
}

import "server-only";

import { Types } from "mongoose";

import connectToDatabase from "@/database/mongodb";
import { ForbiddenError, UnauthorizedError } from "@/lib/http-errors";
import User from "@/models/user.model";
import type { UserRole } from "@/types/global";

type SessionUserIdentity = {
  id?: string;
  email?: string | null;
};

export type ActiveDatabaseUser = {
  id: string;
  role: UserRole;
};

export async function requireActiveDatabaseUser(
  sessionUser: SessionUserIdentity
): Promise<ActiveDatabaseUser> {
  const id = sessionUser.id;
  const email = sessionUser.email?.trim().toLowerCase();

  if (!id || !email || !Types.ObjectId.isValid(id)) {
    throw new UnauthorizedError("Your session is no longer valid.");
  }

  await connectToDatabase();

  const user = await User.findOne({
    _id: id,
    email,
  })
    .select("_id role isActive")
    .lean();

  if (!user) {
    throw new UnauthorizedError(
      "Your account no longer exists. Please sign in again."
    );
  }

  if (!user.isActive) {
    throw new UnauthorizedError("Your account is inactive.");
  }

  if (!user.role) {
    throw new ForbiddenError("Your account does not have an assigned role.");
  }

  return {
    id: user._id.toString(),
    role: user.role,
  };
}

import "server-only";

import type { ClientSession, Types } from "mongoose";

import { ConflictError, NotFoundError } from "@/lib/http-errors";
import User from "@/models/user.model";

type PopulatedUserReference = {
  _id: { toString(): string };
  email?: string;
  isActive?: boolean;
};

function isPopulatedUserReference(
  reference: unknown
): reference is PopulatedUserReference {
  return (
    typeof reference === "object" &&
    reference !== null &&
    "_id" in reference
  );
}

export async function assertEmailIsUnique(
  email: string,
  excludedUserId?: string,
  session?: ClientSession
): Promise<void> {
  const query = User.exists({
    email,
    ...(excludedUserId ? { _id: { $ne: excludedUserId } } : {}),
  });

  if (session) query.session(session);

  if (await query) {
    throw new ConflictError(`Email "${email}" is already in use`);
  }
}

export async function findUserIdsByEmailSearch(
  searchTerm: string
): Promise<Types.ObjectId[]> {
  return User.find({
    email: { $regex: searchTerm, $options: "i" },
  }).distinct<"_id", Types.ObjectId>("_id");
}

export function getUserId(reference: unknown): string {
  if (isPopulatedUserReference(reference)) {
    return reference._id.toString();
  }

  if (reference && typeof reference === "object" && "toString" in reference) {
    return (reference as { toString(): string }).toString();
  }

  throw new NotFoundError("Employee user account");
}

export function getUserEmail(reference: unknown): string {
  if (isPopulatedUserReference(reference) && reference.email) {
    return reference.email;
  }

  throw new NotFoundError("Employee user account");
}

export function isUserActive(reference: unknown): boolean {
  return (
    isPopulatedUserReference(reference) && reference.isActive === true
  );
}

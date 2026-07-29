import "server-only";

import connectToDatabase from "@/database/mongodb";
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/http-errors";
import Employee from "@/models/employee.model";
import User, { type IUser } from "@/models/user.model";
import { SignInWithOAuth } from "@/validations/user.schema";

const PORTAL_EMPLOYMENT_STATUSES = ["Active", "On Leave"] as const;

export async function synchronizeOAuthUser(input: unknown): Promise<void> {
  const validationResult = SignInWithOAuth.safeParse(input);

  if (!validationResult.success) {
    throw new ValidationError(
      validationResult.error.flatten().fieldErrors
    );
  }

  const { email, image, provider, providerId } = validationResult.data;

  await connectToDatabase();

  const existingUser = await User.findOne({ email }).select(
    "_id image provider providerId isActive"
  );

  if (!existingUser) {
    throw new UnauthorizedError("This email is not registered.");
  }

  if (!existingUser.isActive) {
    throw new ForbiddenError("This account is inactive.");
  }

  const employee = await Employee.findOne({
    userId: existingUser._id,
  })
    .select("employmentStatus")
    .lean();

  if (!employee) {
    throw new UnauthorizedError("Employee record not found.");
  }

  if (!PORTAL_EMPLOYMENT_STATUSES.includes(employee.employmentStatus)) {
    throw new ForbiddenError(
      "Your employment status does not permit portal access."
    );
  }

  const updates: Partial<IUser> = {
    lastLogin: new Date(),
  };

  if (existingUser.image !== image) updates.image = image;
  if (existingUser.provider !== provider) updates.provider = provider;
  if (existingUser.providerId !== providerId) updates.providerId = providerId;

  const updateResult = await User.updateOne(
    { _id: existingUser._id, isActive: true },
    { $set: updates },
    { runValidators: true }
  );

  if (updateResult.matchedCount !== 1) {
    throw new UnauthorizedError("This account is no longer available.");
  }
}

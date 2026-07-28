import "server-only";

import mongoose from "mongoose";

import Employee from "@/models/employee.model";
import User from "@/models/user.model";
import { ConflictError, isDuplicateKeyError, NotFoundError } from "../http-errors";
import { assertEmailIsUnique } from "./user.helper";

type UpdateEmployeeAndUserProfileParams = {
  employeeDatabaseId: string;
  userId: string;
  email: string;
  employeeUpdates: Readonly<Record<string, unknown>>;
};

export async function updateEmployeeAndUserProfile({
  employeeDatabaseId,
  userId,
  email,
  employeeUpdates,
}: UpdateEmployeeAndUserProfileParams): Promise<void> {
  const session = await mongoose.startSession();

  try {
    await session.withTransaction(async (): Promise<void> => {
      await assertEmailIsUnique(email, userId, session);

      const employeeResult = Object.keys(employeeUpdates).length
        ? await Employee.updateOne(
            { _id: employeeDatabaseId, userId },
            { $set: employeeUpdates },
            { runValidators: true, session }
          )
        : await Employee.exists({
            _id: employeeDatabaseId,
            userId,
          }).session(session);
      const userResult = await User.updateOne(
        { _id: userId },
        { $set: { email } },
        { runValidators: true, session }
      );
      const employeeExists =
        employeeResult !== null &&
        (!("matchedCount" in employeeResult) || employeeResult.matchedCount > 0);

      if (!employeeExists) throw new NotFoundError("Employee");
      if (userResult.matchedCount === 0) {
        throw new NotFoundError("Employee user account");
      }
    });
  } catch (error) {
    if (isDuplicateKeyError(error)) {
      throw new ConflictError(`Email "${email}" is already in use`);
    }

    throw error;
  } finally {
    await session.endSession();
  }
}

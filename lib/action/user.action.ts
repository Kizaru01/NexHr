"use server";

import User from "@/models/user.model";
import type { ActionResponse, ErrorResponse } from "@/types/global";
import { registerUserSchema } from "@/validations/user.schema";
import action from "../handler/action-helper";
import handleError from "../handler/error";
import { ConflictError } from "../http-errors";

interface CreateUserParams {
  email: string;
}

export async function createUser(
  params: CreateUserParams
): Promise<ActionResponse> {
  const validatedResult = await action({
    params,
    schema: registerUserSchema,
    roles: ["admin", "hr"],
  });
  const { email } = validatedResult.params!;
  const normalizedEmail = email.toLowerCase();

  try {
    const existingUser = await User.findOne({ email: normalizedEmail });

    if (existingUser) throw new ConflictError("Email already registered");

    await User.create({
      email: normalizedEmail,
    });

    return {
      success: true,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

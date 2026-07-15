"use server";

import { ActionResponse, ErrorResponse } from "@/types/global";
import action from "../handler/action-helper";
import User from "@/models/user.model";
import { ConflictError } from "../http-errors";
import handleError from "../handler/error";
import { registerUserSchema } from "@/validations/user.schema";
interface createUserParams {
  email: string;
}
export async function createUser(
  params: createUserParams
): Promise<ActionResponse> {
  const validatedResult = await action({
    params,
    schema: registerUserSchema,
    roles: ["admin", "hr"],
  });
  const { email } = validatedResult.params!;
  try {
    const existingUser = await User.findOne({ email });

    if (existingUser) throw new ConflictError("Email already registered");

    await User.create({
      email,
    });

    return {
      success: true,
    };
  } catch (error) {
    return handleError(error) as ErrorResponse;
  }
}

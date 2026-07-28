import { NextResponse } from "next/server";

import connectToDatabase from "@/database/mongodb";
import handleError from "@/lib/handler/error";
import {
  ForbiddenError,
  UnauthorizedError,
  ValidationError,
} from "@/lib/http-errors";
import Employee from "@/models/employee.model";
import User, { IUser } from "@/models/user.model";
import { SignInWithOAuth } from "@/validations/user.schema";

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    await connectToDatabase();

    const validateData = SignInWithOAuth.safeParse(body);

    if (!validateData.success)
      throw new ValidationError(validateData.error.flatten().fieldErrors);

    const { email, image, provider, providerId } = validateData.data;
    const existingUser = await User.findOne({ email });

    if (!existingUser) {
      throw new UnauthorizedError("This email is not registered.");
    }
    if (!existingUser.isActive) {
      throw new ForbiddenError("This is account is inactive.");
    }

    const employee = await Employee.findOne({ userId: existingUser._id });

    if (!employee) {
      throw new UnauthorizedError("Employee record not found.");
    }

    const updatedData: Partial<IUser> = {
      lastLogin: new Date(),
    };

    if (existingUser.image !== image) updatedData.image = image;
    if (existingUser.provider !== provider) updatedData.provider = provider;
    if (existingUser.providerId !== providerId)
      updatedData.providerId = providerId;

    if (Object.keys(updatedData).length > 0) {
      await User.updateOne({ _id: existingUser._id }, { $set: updatedData });
    }

    return NextResponse.json(
      { success: true, data: existingUser },
      { status: 200 }
    );
  } catch (error) {
    return handleError(error, "api");
  }
}

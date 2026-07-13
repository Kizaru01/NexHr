import connectToDatabase from "@/database/mongodb";
import handleError from "@/lib/handler/error";
import { ValidationError } from "@/lib/http-errors";
import User, { IUser } from "@/models/user.model";
import { SignInWithOAuth } from "@/validations/user.schema";
import mongoose from "mongoose";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();

  await connectToDatabase();

  const session = await mongoose.startSession();

  try {
    session.startTransaction();
    const validateData = SignInWithOAuth.safeParse(body);

    if (!validateData.success)
      throw new ValidationError(validateData.error.flatten().fieldErrors);

    const { name, email, image, provider, providerId } = validateData.data;

    let created = false;

    let existingUser = await User.findOne({ email }).session(session);

    if (!existingUser) {
      created = true;
      [existingUser] = await User.create(
        [
          {
            name,
            email,
            image,
            provider,
            providerId,
          },
        ],
        { session }
      );
    }
    const updatedData: Partial<IUser> = {
      lastLogin: new Date(),
    };

    if (existingUser.name !== name) updatedData.name = name;
    if (existingUser.image !== image) updatedData.image = image;

    if (Object.keys(updatedData).length > 0) {
      await User.updateOne(
        { _id: existingUser._id },
        { $set: updatedData }
      ).session(session);
    }

    await session.commitTransaction();

    return NextResponse.json(
      { success: true, data: existingUser },
      { status: created ? 201 : 200 }
    );
  } catch (error) {
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return handleError(error, "api") as APIErrorResponse;
  } finally {
    await session.endSession();
  }
}

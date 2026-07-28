import { NextResponse } from "next/server";

import connectToDatabase from "@/database/mongodb";
import handleError from "@/lib/handler/error";
import { UnauthorizedError } from "@/lib/http-errors";
import { verifyActivationToken } from "@/lib/services/activation-token.service";
import User from "@/models/user.model";

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const token = new URL(request.url).searchParams.get("token");

    if (!token) {
      throw new UnauthorizedError("The activation link is invalid or expired.");
    }

    const payload = verifyActivationToken(token);
    await connectToDatabase();

    const user = await User.findOne({
      _id: payload.sub,
      email: payload.email,
    }).select("isActive");

    if (!user) {
      throw new UnauthorizedError("The activation link is invalid or expired.");
    }

    if (!user.isActive) {
      user.isActive = true;
      await user.save();
    }

    return NextResponse.redirect(
      new URL("/sign-in?accountActivated=true", request.url)
    );
  } catch (error) {
    return handleError(error, "api");
  }
}

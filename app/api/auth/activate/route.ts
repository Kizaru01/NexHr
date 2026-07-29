import { NextResponse } from "next/server";

import connectToDatabase from "@/database/mongodb";
import handleError from "@/lib/handler/error";
import { RequestError, UnauthorizedError } from "@/lib/http-errors";
import { verifyActivationToken } from "@/lib/services/activation-token.service";
import User from "@/models/user.model";

const INVALID_LINK_MESSAGE = "The activation link is invalid or expired.";

function getTokenOrThrow(token: string | null): string {
  if (!token) throw new UnauthorizedError(INVALID_LINK_MESSAGE);
  return token;
}

function activationPageUrl(
  request: Request,
  params: { status?: "error" | "invalid"; token?: string }
): URL {
  const url = new URL("/activate", request.url);
  if (params.status) url.searchParams.set("status", params.status);
  if (params.token) url.searchParams.set("token", params.token);
  return url;
}

function personalPageUrl(request: Request): URL {
  return new URL("/personal?accountActivated=true", request.url);
}

async function findActivationUser(payload: {
  sub: string;
  email: string;
}): Promise<{
  activatedAt?: Date;
  activationTokenExpiresAt?: Date;
  activationTokenId?: string;
  isActive: boolean;
} | null> {
  return User.findOne({
    _id: payload.sub,
    email: payload.email,
  })
    .select(
      "isActive activatedAt +activationTokenId +activationTokenExpiresAt"
    )
    .lean();
}

export async function GET(request: Request): Promise<NextResponse> {
  try {
    const token = getTokenOrThrow(
      new URL(request.url).searchParams.get("token")
    );
    const payload = verifyActivationToken(token);
    await connectToDatabase();

    const user = await findActivationUser(payload);
    if (user?.isActive && user.activatedAt) {
      return NextResponse.redirect(personalPageUrl(request));
    }

    if (
      !user ||
      user.isActive ||
      user.activationTokenId !== payload.tokenId ||
      !user.activationTokenExpiresAt ||
      user.activationTokenExpiresAt <= new Date()
    ) {
      throw new UnauthorizedError(INVALID_LINK_MESSAGE);
    }

    return NextResponse.redirect(activationPageUrl(request, { token }));
  } catch (error) {
    return NextResponse.redirect(
      activationPageUrl(request, {
        status: error instanceof RequestError ? "invalid" : "error",
      })
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const tokenValue = formData.get("token");
    const token = getTokenOrThrow(
      typeof tokenValue === "string" ? tokenValue : null
    );
    const payload = verifyActivationToken(token);
    await connectToDatabase();

    const activationResult = await User.updateOne(
      {
        _id: payload.sub,
        email: payload.email,
        isActive: false,
        activationTokenId: payload.tokenId,
        activationTokenExpiresAt: { $gt: new Date() },
      },
      {
        $set: {
          isActive: true,
          activatedAt: new Date(),
        },
        $unset: {
          activationTokenId: "",
          activationTokenExpiresAt: "",
        },
      },
      { runValidators: true }
    );

    if (activationResult.modifiedCount !== 1) {
      const user = await findActivationUser(payload);
      if (!user?.isActive || !user.activatedAt) {
        throw new UnauthorizedError(INVALID_LINK_MESSAGE);
      }
    }

    return NextResponse.redirect(personalPageUrl(request), 303);
  } catch (error) {
    if (error instanceof RequestError) {
      return NextResponse.redirect(
        activationPageUrl(request, { status: "invalid" }),
        303
      );
    }

    return handleError(error, "api");
  }
}

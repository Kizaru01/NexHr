import "server-only";

import { createHmac, randomUUID, timingSafeEqual } from "node:crypto";
import z from "zod";

import { UnauthorizedError } from "@/lib/http-errors";
import { emailSchema } from "@/validations/user.schema";

const ACTIVATION_TOKEN_LIFETIME_SECONDS = 60 * 60 * 24 * 7;

const activationTokenPayloadSchema = z.object({
  sub: z.string().min(1),
  email: emailSchema,
  issuedAt: z.number().int().positive(),
  expiresAt: z.number().int().positive(),
  tokenId: z.string().uuid(),
});

export type ActivationTokenPayload = z.infer<
  typeof activationTokenPayloadSchema
>;

type CreateActivationTokenParams = {
  userId: string;
  email: string;
  issuedAt?: Date;
  tokenId?: string;
};

function getSigningSecret(): string {
  const secret = process.env.AUTH_SECRET;

  if (!secret) {
    throw new Error("AUTH_SECRET is required to generate activation tokens.");
  }

  return secret;
}

function signPayload(encodedPayload: string): string {
  return createHmac("sha256", getSigningSecret())
    .update(encodedPayload)
    .digest("base64url");
}

export function createActivationToken({
  userId,
  email,
  issuedAt: issuedAtDate,
  tokenId = randomUUID(),
}: CreateActivationTokenParams): string {
  const issuedAt = Math.floor((issuedAtDate?.getTime() ?? Date.now()) / 1000);
  const payload: ActivationTokenPayload = {
    sub: userId,
    email,
    issuedAt,
    expiresAt: issuedAt + ACTIVATION_TOKEN_LIFETIME_SECONDS,
    tokenId,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url"
  );

  return `${encodedPayload}.${signPayload(encodedPayload)}`;
}

export function verifyActivationToken(token: string): ActivationTokenPayload {
  try {
    const [encodedPayload, suppliedSignature, extraPart] = token.split(".");

    if (!encodedPayload || !suppliedSignature || extraPart) {
      throw new Error("Malformed activation token.");
    }

    const expectedSignature = signPayload(encodedPayload);
    const suppliedBuffer = Buffer.from(suppliedSignature);
    const expectedBuffer = Buffer.from(expectedSignature);

    if (
      suppliedBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(suppliedBuffer, expectedBuffer)
    ) {
      throw new Error("Invalid activation token signature.");
    }

    const payload = activationTokenPayloadSchema.parse(
      JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"))
    );

    if (payload.expiresAt <= Math.floor(Date.now() / 1000)) {
      throw new Error("Activation token has expired.");
    }

    return payload;
  } catch {
    throw new UnauthorizedError("The activation link is invalid or expired.");
  }
}

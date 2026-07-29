import "server-only";

import logger from "@/lib/logger";
import { createActivationToken } from "@/lib/services/activation-token.service";
import emailService from "@/lib/services/email.service";
import User from "@/models/user.model";

export type EmployeeWelcomeEmailDelivery = {
  activationIssuedAt: Date;
  email: string;
  employeeId: string;
  tokenId: string;
  userId: string;
};

async function recordFailedDelivery(
  delivery: EmployeeWelcomeEmailDelivery,
  attemptedAt: Date
): Promise<void> {
  try {
    await User.updateOne(
      {
        _id: delivery.userId,
        email: delivery.email,
        activationTokenId: delivery.tokenId,
        welcomeEmailStatus: { $ne: "sent" },
      },
      {
        $set: {
          welcomeEmailStatus: "failed",
          welcomeEmailLastAttemptAt: attemptedAt,
        },
        $unset: {
          welcomeEmailRetryLockedUntil: "",
        },
      },
      { runValidators: true }
    );
  } catch (statusError) {
    logger.error(
      {
        err: statusError,
        employeeId: delivery.employeeId,
        userId: delivery.userId,
      },
      "The failed welcome email could not be recorded."
    );
  }
}

export async function deliverEmployeeWelcomeEmail(
  delivery: EmployeeWelcomeEmailDelivery
): Promise<void> {
  const attemptedAt = new Date();

  try {
    const activationToken = createActivationToken({
      userId: delivery.userId,
      email: delivery.email,
      issuedAt: delivery.activationIssuedAt,
      tokenId: delivery.tokenId,
    });

    await emailService.sendWelcomeEmail({
      to: delivery.email,
      employeeId: delivery.employeeId,
      activationToken,
      requestId: delivery.tokenId,
    });

    const deliveryResult = await User.updateOne(
      {
        _id: delivery.userId,
        email: delivery.email,
        $or: [
          { activationTokenId: delivery.tokenId },
          { isActive: true },
        ],
      },
      {
        $set: {
          welcomeEmailStatus: "sent",
          welcomeEmailSentAt: attemptedAt,
          welcomeEmailLastAttemptAt: attemptedAt,
        },
        $unset: {
          welcomeEmailRetryLockedUntil: "",
        },
      },
      { runValidators: true }
    );

    if (deliveryResult.matchedCount !== 1) {
      throw new Error(
        "The employee account changed before email delivery was recorded."
      );
    }
  } catch (error) {
    await recordFailedDelivery(delivery, attemptedAt);
    throw error;
  }
}

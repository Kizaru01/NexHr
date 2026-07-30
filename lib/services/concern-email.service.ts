import "server-only";

import type {
  ConcernCategory,
  ConcernStatus,
} from "@/constants/concerns";
import emailService from "@/lib/services/email.service";
import logger from "@/lib/logger";

type EmailRecipient = {
  email: string;
};

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>'"]/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "'": "&#39;",
        '"': "&quot;",
      })[character] ?? character
  );
}

function applicationLink(pathname: string): string | null {
  const applicationUrl = process.env.NEXTAUTH_URL;

  if (!applicationUrl) {
    return null;
  }

  return new URL(pathname, applicationUrl).toString();
}

async function deliverSafely({
  context,
  idempotencyKey,
  recipients,
  subject,
  text,
  html,
}: {
  context: Record<string, unknown>;
  idempotencyKey: string;
  recipients: EmailRecipient[];
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const deliveries = await Promise.allSettled(
    recipients.map((recipient) =>
      emailService.sendEmail({
        to: recipient.email,
        subject,
        text,
        html,
        idempotencyKey: `${idempotencyKey}-${recipient.email}`,
      })
    )
  );

  deliveries.forEach((delivery, index) => {
    if (delivery.status === "rejected") {
      logger.error(
        {
          ...context,
          email: recipients[index]?.email,
          err: delivery.reason,
        },
        "Concern email delivery failed."
      );
    }
  });
}

function emailShell({
  eyebrow,
  heading,
  body,
  actionLabel,
  actionUrl,
}: {
  eyebrow: string;
  heading: string;
  body: string;
  actionLabel: string;
  actionUrl: string | null;
}): string {
  return `
    <main style="font-family: Arial, sans-serif; line-height: 1.6; color: #172033; max-width: 640px; margin: 0 auto; padding: 28px;">
      <p style="color: #6366f1; font-size: 12px; font-weight: 700; letter-spacing: .08em; text-transform: uppercase;">${escapeHtml(eyebrow)}</p>
      <h1 style="font-size: 24px; line-height: 1.25; margin: 8px 0 14px;">${escapeHtml(heading)}</h1>
      <p style="color: #526079;">${escapeHtml(body)}</p>
      ${
        actionUrl
          ? `<p style="margin-top: 24px;"><a href="${escapeHtml(actionUrl)}" style="display: inline-block; border-radius: 8px; background: #6366f1; color: #fff; padding: 10px 16px; text-decoration: none; font-weight: 600;">${escapeHtml(actionLabel)}</a></p>`
          : ""
      }
      <p style="margin-top: 28px; color: #7b879d; font-size: 12px;">This is an automated message from NexHR. Sign in to the portal to view the concern and its current status.</p>
    </main>
  `;
}

export async function emailHrAboutNewConcern({
  caseNumber,
  category,
  employeeName,
  recipients,
  subject,
}: {
  caseNumber: string;
  category: ConcernCategory;
  employeeName: string;
  recipients: EmailRecipient[];
  subject: string;
}): Promise<void> {
  if (!recipients.length) return;

  const url = applicationLink(`/employee-concerns/${caseNumber}`);
  const body = `${employeeName} submitted a ${category.toLowerCase()} concern: “${subject}”. It is ready for triage in the HR workspace.`;

  await deliverSafely({
    context: { caseNumber },
    idempotencyKey: `concern-created-${caseNumber}`,
    recipients,
    subject: `[${caseNumber}] New employee concern`,
    text: `${body}${url ? `\n\nOpen concern: ${url}` : ""}`,
    html: emailShell({
      eyebrow: `New concern · ${caseNumber}`,
      heading: subject,
      body,
      actionLabel: "Review concern",
      actionUrl: url,
    }),
  });
}

export async function emailEmployeeAboutConcernUpdate({
  caseNumber,
  employeeEmail,
  idempotencyKey,
  status,
  subject,
  update,
}: {
  caseNumber: string;
  employeeEmail: string;
  idempotencyKey: string;
  status: ConcernStatus;
  subject: string;
  update: string;
}): Promise<void> {
  const url = applicationLink(`/employee/concerns/${caseNumber}`);
  const body = `${update} Current status: ${status}.`;

  await deliverSafely({
    context: { caseNumber },
    idempotencyKey,
    recipients: [{ email: employeeEmail }],
    subject: `[${caseNumber}] ${subject}`,
    text: `${body}${url ? `\n\nView concern: ${url}` : ""}`,
    html: emailShell({
      eyebrow: `Concern update · ${caseNumber}`,
      heading: subject,
      body,
      actionLabel: "View update",
      actionUrl: url,
    }),
  });
}

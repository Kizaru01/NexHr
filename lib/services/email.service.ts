import "server-only";

export type SendEmailParams = {
  to: string;
  subject: string;
  html: string;
  text: string;
  idempotencyKey?: string;
};

type SendWelcomeEmailParams = {
  to: string;
  employeeName: string;
  employeeId: string;
  activationToken: string;
  requestId: string;
};

export type EmailDeliveryResult = {
  messageId: string;
};

type ResendResponse = {
  id?: string;
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

export class EmailService {
  async sendEmail({
    to,
    subject,
    html,
    text,
    idempotencyKey,
  }: SendEmailParams): Promise<EmailDeliveryResult> {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM;

    if (!apiKey || !from) {
      throw new Error(
        "Email delivery is not configured. RESEND_API_KEY and EMAIL_FROM are required."
      );
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        ...(idempotencyKey ? { "Idempotency-Key": idempotencyKey } : {}),
      },
      body: JSON.stringify({ from, to: [to], subject, html, text }),
    });

    if (!response.ok) {
      const providerMessage = (await response.text()).slice(0, 300);
      throw new Error(
        `Email provider rejected the request (${response.status}): ${providerMessage}`
      );
    }

    const result = (await response.json()) as ResendResponse;

    if (!result.id) {
      throw new Error("Email provider did not return a message identifier.");
    }

    return { messageId: result.id };
  }

  async sendWelcomeEmail({
    to,
    employeeName,
    employeeId,
    activationToken,
    requestId,
  }: SendWelcomeEmailParams): Promise<EmailDeliveryResult> {
    const applicationUrl = process.env.NEXTAUTH_URL;

    if (!applicationUrl) {
      throw new Error(
        "NEXTAUTH_URL is required to build the account activation link."
      );
    }

    const activationUrl = new URL("/api/auth/activate", applicationUrl);
    activationUrl.searchParams.set("token", activationToken);

    const safeName = escapeHtml(employeeName);
    const safeEmployeeId = escapeHtml(employeeId);
    const safeActivationUrl = escapeHtml(activationUrl.toString());

    return this.sendEmail({
      to,
      subject: "Welcome to the HR Management Portal",
      idempotencyKey: `employee-welcome-${requestId}`,
      text: [
        `Welcome, ${employeeName}!`,
        `Your employee ID is ${employeeId}.`,
        "Activate your account using the link below. The link expires in 7 days.",
        activationUrl.toString(),
      ].join("\n\n"),
      html: `
        <main style="font-family: Arial, sans-serif; line-height: 1.6; color: #18181b;">
          <h1>Welcome, ${safeName}!</h1>
          <p>Your employee profile has been created.</p>
          <p><strong>Employee ID:</strong> ${safeEmployeeId}</p>
          <p>
            <a href="${safeActivationUrl}" style="display: inline-block; border-radius: 6px; background: #18181b; color: #fff; padding: 10px 16px; text-decoration: none;">
              Activate account
            </a>
          </p>
          <p>This activation link expires in 7 days.</p>
        </main>
      `,
    });
  }
}

const emailService = new EmailService();

export default emailService;

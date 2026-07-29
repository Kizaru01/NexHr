import { CircleAlert, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { verifyActivationToken } from "@/lib/services/activation-token.service";

type ActivatePageProps = {
  searchParams: Promise<{
    status?: string;
    token?: string;
  }>;
};

export default async function ActivatePage({
  searchParams,
}: ActivatePageProps): Promise<React.JSX.Element> {
  const { status, token } = await searchParams;
  let tokenIsValid = false;

  if (token && !status) {
    try {
      verifyActivationToken(token);
      tokenIsValid = true;
    } catch {
      tokenIsValid = false;
    }
  }

  if (!tokenIsValid) {
    const serverError = status === "error";

    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-destructive/10 text-destructive">
              <CircleAlert />
            </div>
            <CardTitle>
              {serverError
                ? "Activation is temporarily unavailable"
                : "Activation link unavailable"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {serverError
                ? "Please try the link again shortly. If the problem continues, contact your HR team."
                : "This activation link is invalid or expired. Contact your HR team for assistance."}
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10">
      <Card className="w-full">
        <CardHeader>
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <ShieldCheck />
          </div>
          <CardTitle>Activate your employee account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-muted-foreground">
            Confirm activation to enable your account. You will then sign in
            with your work email and complete your personal profile.
          </p>
          <form action="/api/auth/activate" method="post">
            <input type="hidden" name="token" value={token} />
            <Button type="submit" className="w-full">
              Activate account
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

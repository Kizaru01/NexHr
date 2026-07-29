import { CheckCircle2, ClipboardCheck } from "lucide-react";
import { notFound } from "next/navigation";

import { auth } from "@/auth";
import OwnProfileForm from "@/components/employee-portal/OwnProfileForm";
import SocialAuth from "@/components/Forms/SocialAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireEmployeePersonalPage } from "@/lib/handler/require-employee";
import { getOwnEmployeeProfile } from "@/lib/queries/employee-portal/employee-portal.profile";

type PersonalPageProps = {
  searchParams: Promise<{ accountActivated?: string }>;
};

export default async function PersonalPage({
  searchParams,
}: PersonalPageProps): Promise<React.JSX.Element> {
  const session = await auth();
  const { accountActivated } = await searchParams;

  if (!session?.user?.id) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-lg items-center px-4 py-10">
        <Card className="w-full">
          <CardHeader>
            <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-success-soft text-success-foreground">
              <CheckCircle2 />
            </div>
            <CardTitle>
              {accountActivated === "true"
                ? "Account activated"
                : "Complete your employee profile"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <p className="text-sm text-muted-foreground">
              Sign in with the work email that received the activation link.
              You will complete your required personal information before
              entering the employee dashboard.
            </p>
            <SocialAuth callbackUrl="/personal" />
          </CardContent>
        </Card>
      </main>
    );
  }

  const { employeeDatabaseId, userId } =
    await requireEmployeePersonalPage();
  const profile = await getOwnEmployeeProfile(employeeDatabaseId, userId);

  if (!profile) notFound();

  return (
    <main className="mx-auto min-h-screen w-full max-w-4xl space-y-6 px-4 py-10 sm:px-6">
      <div className="space-y-2">
        <div className="flex size-11 items-center justify-center rounded-xl bg-primary text-primary-foreground">
          <ClipboardCheck />
        </div>
        <p className="page-eyebrow">Employee onboarding</p>
        <h1 className="heading-1">Complete your personal profile</h1>
        <p className="page-description">
          HR provided your name, contact number, and work email. Complete the
          remaining fields below to unlock your dashboard. Only your middle
          name is optional.
        </p>
      </div>
      <OwnProfileForm onboarding profile={profile} />
    </main>
  );
}

import { UsersRound } from "lucide-react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-10">
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,var(--primary-soft),transparent_68%)]"
      />
      <section className="surface-card relative w-full max-w-md p-6 sm:p-8">
        <div>
          <div className="mb-8 flex items-center gap-3">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <UsersRound className="size-5" />
            </span>
            <div>
              <p className="text-base font-semibold tracking-[-0.02em]">NexHR</p>
              <p className="text-xs text-muted-foreground">Workplace management</p>
            </div>
          </div>
          <h1 className="heading-1">Welcome back</h1>
          <p className="page-description">
            Sign in to manage your people, time, leave, and payroll workspace.
          </p>
        </div>
        {children}
      </section>
    </main>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, UsersRound } from "lucide-react";
import { toast } from "sonner";

import NavLinks from "@/components/Navlink";
import { Button } from "@/components/ui/button";
import { signOutFromApplication } from "@/lib/action/auth.action";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/global";

import { useNavigation } from "./NavigationProvider";

type ApplicationNavigationProps = {
  user?: {
    image?: string | null;
    name?: string | null;
    role?: UserRole;
  };
  variant: "desktop" | "mobile";
  onNavigate?: () => void;
};

export default function ApplicationNavigation({
  user,
  variant,
}: ApplicationNavigationProps): React.JSX.Element {
  const isDesktop = variant === "desktop";
  const router = useRouter();
  const { isSidebarExpanded } = useNavigation();
  const isCompact = isDesktop && !isSidebarExpanded;

  async function submitSignOut(): Promise<void> {
    const response = await signOutFromApplication();

    if (!response.success) {
      toast.error("Failed to sign out", {
        description: response.error.message,
      });
      return;
    }

    router.push("/sign-in");
    router.refresh();
  }

  return (
    <div className="flex h-full flex-col justify-between">
      <div
        className={cn(
          "space-y-5 pt-4",
          isCompact ? "px-2 xl:px-3" : "px-3"
        )}
      >
        <Link
          href={user?.role === "employee" ? "/employee" : "/"}
          className={cn(
            "flex min-h-12 items-center gap-3 rounded-xl px-2 text-foreground outline-none transition-colors hover:bg-muted/70 focus-visible:ring-2 focus-visible:ring-ring",
            isCompact && "justify-center xl:justify-start"
          )}
          aria-label="NexHR dashboard"
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-[0.65rem] bg-primary text-primary-foreground shadow-sm",
              isCompact && "xl:flex"
            )}
          >
            <UsersRound className="size-[1.125rem]" />
          </span>
          <span
            className={cn(
              "min-w-0",
              isCompact && "hidden xl:inline"
            )}
          >
            <span className="block text-[0.9375rem] font-semibold tracking-[-0.02em]">
              NexHR
            </span>
            <span className="block text-[0.625rem] text-muted-foreground">
              Workplace management
            </span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLinks variant={variant} role={user?.role} />
        </nav>
      </div>

      {user ? (
        <div className={cn("p-3", isCompact && "px-2 xl:px-3")}>
          <div
            className={cn(
              "flex items-center gap-3 rounded-xl border border-sidebar-border bg-muted/55 p-2.5",
              isCompact && "justify-center xl:justify-start"
            )}
          >
            <Image
              src={user.image ?? "/avatar1.png"}
              alt={`${user.name ?? "User"} profile`}
              width={40}
              height={40}
              className="size-9 rounded-full object-cover ring-2 ring-card"
            />
            <div className={cn("min-w-0 flex-1", isCompact && "hidden xl:block")}>
              <p className="truncate text-[0.8125rem] font-semibold">{user.name ?? "User"}</p>
              <p className="text-[0.6875rem] capitalize text-muted-foreground">
                {user.role ?? "employee"}
              </p>
            </div>
            <form
              action={submitSignOut}
              className={cn(isCompact && "hidden xl:block")}
            >
              <Button type="submit" variant="ghost" size="icon-sm" aria-label="Sign out">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className={cn("space-y-2 p-3", isCompact && "px-2 xl:px-3")}>
          <Button asChild className="w-full">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

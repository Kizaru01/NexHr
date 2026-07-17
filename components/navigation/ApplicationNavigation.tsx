"use client";

import Image from "next/image";
import Link from "next/link";
import { LogOut } from "lucide-react";

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
}: ApplicationNavigationProps) {
  const isDesktop = variant === "desktop";
  const { isSidebarExpanded } = useNavigation();
  const isCompact = isDesktop && !isSidebarExpanded;

  return (
    <div className="flex h-full flex-col justify-between">
      <div
        className={cn(
          "space-y-5 pt-5",
          isCompact ? "px-2 xl:px-4" : "px-5"
        )}
      >
        <Link
          href={user?.role === "employee" ? "/employee" : "/"}
          className={cn(
            "flex min-h-10 items-center rounded-lg px-3 text-foreground outline-none transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring",
            isCompact && "justify-center xl:justify-start"
          )}
          aria-label="NexHR dashboard"
        >
          <span
            aria-hidden="true"
            className={cn(
              "flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground",
              isCompact ? "xl:hidden" : "hidden"
            )}
          >
            N
          </span>
          <span
            className={cn(
              "text-xl font-bold tracking-tight",
              isCompact && "hidden xl:inline"
            )}
          >
            Nex<span className="text-primary">HR</span>
          </span>
        </Link>
        <nav aria-label="Main navigation">
          <NavLinks variant={variant} role={user?.role} />
        </nav>
      </div>

      {user ? (
        <div className={cn("border-t border-border p-4", isCompact && "px-2 xl:px-4")}>
          <div
            className={cn(
              "flex items-center gap-3",
              isCompact && "justify-center xl:justify-start"
            )}
          >
            <Image
              src={user.image ?? "/avatar1.png"}
              alt={`${user.name ?? "User"} profile`}
              width={40}
              height={40}
              className="size-10 rounded-full object-cover"
            />
            <div className={cn("min-w-0 flex-1", isCompact && "hidden xl:block")}>
              <p className="truncate text-sm font-semibold">{user.name ?? "User"}</p>
              <p className="text-xs capitalize text-muted-foreground">
                {user.role ?? "employee"}
              </p>
            </div>
            <form action={signOutFromApplication} className={cn(isCompact && "hidden xl:block")}>
              <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
                <LogOut className="size-4" />
              </Button>
            </form>
          </div>
        </div>
      ) : (
        <div className={cn("space-y-2 border-t border-border p-4", isCompact && "px-2 xl:px-4")}>
          <Button asChild className="w-full">
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      )}
    </div>
  );
}

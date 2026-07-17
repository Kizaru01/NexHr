"use client";

import { sidebarLinks } from "@/constants";
import { usePathname } from "next/navigation";

import NavigationToggle from "./NavigationToggle";

function getCurrentPageTitle(pathname: string): string {
  const currentPage = sidebarLinks.find((item) =>
    item.href === "/" ? pathname === item.href : pathname.startsWith(item.href)
  );

  return currentPage?.title ?? "NexHR";
}

export default function ResponsiveNavbar() {
  const pathname = usePathname();
  const pageTitle = getCurrentPageTitle(pathname);

  return (
    <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center border-b border-border bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/80 md:px-6 xl:hidden">
      <div className="flex min-w-0 items-center gap-3">
        <NavigationToggle target="mobile" className="md:hidden" />
        <NavigationToggle target="sidebar" className="hidden md:inline-flex" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">
            {pageTitle}
          </p>
          <p className="hidden text-xs text-muted-foreground md:block">
            Workspace navigation
          </p>
        </div>
      </div>
    </header>
  );
}

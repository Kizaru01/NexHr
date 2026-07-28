"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

import { useNavigation } from "./NavigationProvider";

export default function DesktopSidebar({
  children,
}: {
  children: ReactNode;
}): React.JSX.Element {
  const { isSidebarExpanded } = useNavigation();

  return (
    <aside
      id="desktop-navigation"
      aria-label="Primary navigation"
      className={cn(
        "sticky top-3 m-3 mr-0 hidden h-[calc(100vh-1.5rem)] shrink-0 overflow-hidden rounded-2xl border border-sidebar-border bg-sidebar text-sidebar-foreground shadow-[var(--shadow-card)] transition-[width] duration-200 ease-out md:flex",
        isSidebarExpanded ? "w-64" : "w-20 xl:w-64"
      )}
    >
      {children}
    </aside>
  );
}

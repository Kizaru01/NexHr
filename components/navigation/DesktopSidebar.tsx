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
        "sticky top-0 hidden h-screen shrink-0 border-r border-border bg-background transition-[width] duration-200 ease-out md:flex",
        isSidebarExpanded ? "w-72" : "w-20 xl:w-72"
      )}
    >
      {children}
    </aside>
  );
}

"use client";

import { Menu, PanelLeftClose, PanelLeftOpen } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { useNavigation } from "./NavigationProvider";

type NavigationToggleProps = {
  target: "mobile" | "sidebar";
  className?: string;
};

export default function NavigationToggle({
  target,
  className,
}: NavigationToggleProps) {
  const {
    isMobileDrawerOpen,
    isSidebarExpanded,
    setMobileDrawerOpen,
    toggleSidebar,
  } = useNavigation();

  const isMobileToggle = target === "mobile";
  const label = isMobileToggle
    ? "Open navigation menu"
    : isSidebarExpanded
      ? "Collapse navigation sidebar"
      : "Expand navigation sidebar";

  const Icon = isMobileToggle
    ? Menu
    : isSidebarExpanded
      ? PanelLeftClose
      : PanelLeftOpen;

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn(className)}
      aria-label={label}
      aria-expanded={isMobileToggle ? isMobileDrawerOpen : isSidebarExpanded}
      aria-controls={isMobileToggle ? "mobile-navigation" : "desktop-navigation"}
      onClick={() => {
        if (isMobileToggle) {
          setMobileDrawerOpen(true);
          return;
        }

        toggleSidebar();
      }}
    >
      <Icon className="size-4" />
    </Button>
  );
}

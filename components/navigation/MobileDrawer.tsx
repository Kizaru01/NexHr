"use client";

import type { ReactNode } from "react";

import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";

import { useNavigation } from "./NavigationProvider";

export default function MobileDrawer({ children }: { children: ReactNode }): React.JSX.Element {
  const { isMobileDrawerOpen, setMobileDrawerOpen } = useNavigation();

  return (
    <Sheet open={isMobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
      <SheetContent
        id="mobile-navigation"
        side="left"
        className="w-[min(22rem,calc(100vw-2rem))] gap-0 p-0 sm:max-w-none"
      >
        <SheetTitle className="sr-only">Navigation menu</SheetTitle>
        {children}
      </SheetContent>
    </Sheet>
  );
}

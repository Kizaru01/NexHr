"use client";
import { employeeNavigationSections, navigationSections } from "@/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useNavigation } from "./navigation/NavigationProvider";
import type { UserRole } from "@/types/global";

interface NavLinksProps {
  variant: "desktop" | "mobile";
  role?: UserRole;
}

const NavLinks = ({ variant, role }: NavLinksProps): React.JSX.Element => {
  const pathname = usePathname();
  const { closeMobileDrawer, isSidebarExpanded } = useNavigation();
  const isCompact = variant === "desktop" && !isSidebarExpanded;
  const sections =
    role === "employee" ? employeeNavigationSections : navigationSections;

  return (
    <div className="space-y-5">
      {sections.map((section) => (
        <section key={section.title} aria-label={section.title}>
          <p
            className={cn(
              "mb-2 px-3 text-[0.6875rem] font-semibold tracking-[0.08em] text-muted-foreground uppercase",
              isCompact && "hidden xl:block"
            )}
          >
            {section.title}
          </p>
          <div className="space-y-1">
            {section.items.map((item) => {
              const normalizePath = (value: string) =>
                value === "/" ? "/" : value.replace(/\/$/, "");
              const normalizedPathname = normalizePath(pathname);
              const normalizedHref = normalizePath(item.href);
              const isActive =
                normalizedHref === "/"
                  ? normalizedPathname === "/"
                  : normalizedHref === "/employee"
                    ? normalizedPathname === "/employee"
                    : normalizedPathname === normalizedHref ||
                      normalizedPathname.startsWith(`${normalizedHref}/`);
              const Icon = item.icon;

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  title={isCompact ? item.title : undefined}
                  aria-label={isCompact ? item.title : undefined}
                  onClick={variant === "mobile" ? closeMobileDrawer : undefined}
                  className={cn(
                    "group flex min-h-10 items-center rounded-lg py-2.5 gap-2 text-sm font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    isCompact
                      ? "justify-center px-2 xl:justify-start xl:px-3"
                      : "gap-3 px-3",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <Icon className="size-5 shrink-0" />
                  <span
                    className={cn(
                      "min-w-0 truncate",
                      isCompact && "hidden xl:inline"
                    )}
                  >
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
};

export default NavLinks;

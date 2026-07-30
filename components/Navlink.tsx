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
  concernUnreadCount?: number;
}

const NavLinks = ({
  variant,
  role,
  concernUnreadCount = 0,
}: NavLinksProps): React.JSX.Element => {
  const pathname = usePathname();
  const { closeMobileDrawer, isSidebarExpanded } = useNavigation();
  const isCompact = variant === "desktop" && !isSidebarExpanded;
  const sections =
    role === "employee" ? employeeNavigationSections : navigationSections;

  return (
    <div className="space-y-4">
      {sections.map((section) => (
        <section key={section.title} aria-label={section.title}>
          <p
            className={cn(
              "mb-1.5 px-3 text-[0.625rem] font-semibold tracking-[0.1em] text-muted-foreground uppercase",
              isCompact && "hidden xl:block"
            )}
          >
            {section.title}
          </p>
          <div className="space-y-0.5">
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
              const isConcernLink =
                item.href === "/employee-concerns" ||
                item.href === "/employee/concerns";

              return (
                <Link
                  key={item.title}
                  href={item.href}
                  title={isCompact ? item.title : undefined}
                  aria-label={isCompact ? item.title : undefined}
                  onClick={variant === "mobile" ? closeMobileDrawer : undefined}
                  className={cn(
                    "group relative flex min-h-10 items-center gap-2 rounded-lg py-2.5 text-[0.8125rem] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                    isCompact
                      ? "justify-center px-2 xl:justify-start xl:px-3"
                      : "gap-3 px-3",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                  )}
                >
                  <Icon className={cn("size-[1.125rem] shrink-0", isActive && "text-primary")} />
                  <span
                    className={cn(
                      "min-w-0 truncate",
                      isCompact && "hidden xl:inline"
                    )}
                  >
                    {item.title}
                  </span>
                  {isConcernLink && concernUnreadCount > 0 ? (
                    <span
                      className={cn(
                        "ml-auto inline-flex min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 py-0.5 text-[0.625rem] leading-none font-bold text-white shadow-sm",
                        isCompact &&
                          "absolute top-0.5 right-0.5 ml-0 min-w-4 px-1 xl:static xl:ml-auto xl:min-w-5 xl:px-1.5"
                      )}
                      aria-label={`${concernUnreadCount} unread concern updates`}
                    >
                      {concernUnreadCount > 99 ? "99+" : concernUnreadCount}
                    </span>
                  ) : null}
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

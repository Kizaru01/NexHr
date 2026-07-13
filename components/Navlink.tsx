"use client";
import { sidebarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { usePathname } from "next/navigation";
interface Props {
  isMobileNav?: boolean;
}
const NavLinks = ({ isMobileNav = false }: Props) => {
  const pathname = usePathname();

  return (
    <>
      {sidebarLinks.map((item) => {
        const isActive =
          item.href === "/"
            ? pathname === item.href
            : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.title}
            href={item.href}
            className={cn(
              isActive
                ? "bg-gray-200 text-gray-900"
                : "text-black-600 hover:bg-gray-100 hover:text-gray-900",
              "group flex items-center px-4 py-2 text-sm font-medium rounded-l-xl"
            )}
          >
            <Icon className="h-6 w-6 text-black" />
            <p
              className={cn(
                isActive
                  ? "bg-gray-200 text-gray-900"
                  : "text-black-600 hover:bg-gray-100 hover:text-gray-900",
                "group flex items-center px-4 text-lg font-medium rounded-l-lg"
              )}
            >
              {item.title}
            </p>
          </Link>
        );
      })}
    </>
  );
};

export default NavLinks;

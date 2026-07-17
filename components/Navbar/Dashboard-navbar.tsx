import { Bell, CalendarDays, ChevronDown, Mail, Search } from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import { Theme } from "../Theme/Theme";

const Navbar = () => {
  return (
    <header>
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col">
          <Link href="/" className="cursor-pointer">
            <h1 className="text-3xl lg:text-5xl font-bold text-foreground">
              Dashboard
            </h1>
          </Link>

          <p className="text-sm sm:text-md lg:text-lg font-medium text-foreground">
            Welcome back, Charles!
          </p>
        </div>
        <div className="flex items-center justify-end gap-2 max-sm:px-2">
          <div className="flex items-center gap-2 xl:gap-4 ">
            <div className="relative ">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              />

              <input
                type="text"
                placeholder="Search anything..."
                className="h-11 max-w-62 w-full rounded-lg border border-input bg-background pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
            <div className="flex items-center gap-3 xl:gap-5 max-md:hidden">
              <button className="flex h-11 w-11 items-center justify-center rounded-lg border border-border transition-colors hover:bg-accent hover:text-accent-foreground">
                <CalendarDays size={18} />
              </button>
              <button className="relative transition-colors hover:text-primary">
                <Bell size={21} />

                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  2
                </span>
              </button>
              <button className="relative transition-colors hover:text-primary">
                <Mail size={21} />

                <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                  1
                </span>
              </button>
              <Theme />
            </div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <p className="max-sm:hidden text-lg text-muted-foreground">
          Here&apos;s what&apos;s happening in your organization today.
        </p>
        <div className="flex">
          <Button className="max-md:hidden">
            <CalendarDays size={16} />
            Friday, June 27, 2025
            <ChevronDown size={16} />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

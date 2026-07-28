import { Bell, Search } from "lucide-react";
import { Button } from "../ui/button";
import { Theme } from "../Theme/Theme";

const Navbar = (): React.JSX.Element => {
  return (
    <header className="page-header">
      <div>
        <p className="page-eyebrow">People operations</p>
        <h1 className="heading-1">
          Good morning, Charles! <span aria-hidden="true">👋</span>
        </h1>
        <p className="page-description">
          Here&apos;s what&apos;s happening in your organization today.
        </p>
      </div>

      <div className="flex items-center gap-2 self-start sm:self-auto">
        <label className="relative hidden lg:block">
          <span className="sr-only">Search the HR workspace</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search workspace"
            className="h-10 w-48 rounded-lg border border-input bg-card pr-3 pl-9 text-sm text-foreground shadow-sm outline-none transition-[border-color,box-shadow] placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/20 2xl:w-56"
          />
        </label>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label="Notifications"
        >
          <Bell />
          <span className="absolute top-2 right-2 size-2 rounded-full border-2 border-background bg-primary" />
        </Button>

        <Theme />
      </div>
    </header>
  );
};

export default Navbar;

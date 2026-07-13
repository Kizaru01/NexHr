import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import Link from "next/link";
import Image from "next/image";
import { LogOut } from "lucide-react";
import { Button } from "../ui/button";
import NavLinks from "../Navlink";
import { auth, signOut } from "@/auth";

const Mobile = async () => {
  const session = await auth();
  const user = session?.user;
  return (
    <Sheet>
      <SheetTrigger asChild className="lg:hidden">
        <Image
          src="/icons/hamburger.svg"
          alt="menu"
          width={36}
          height={36}
          className="bg-black"
        />
      </SheetTrigger>
      <SheetContent
        side="left"
        className="background-light900_dark200 border-none w-65"
      >
        <SheetTitle>
          <div className="py-4 pl-10">
            <Link href="/" className="flex items-center gap-1">
              <p className="h2-bold text-5xl font-space-grotesk text-dark-100 dark:text-light-900 lg:hidden">
                Nex<span className="text-primary-500">Hr</span>
              </p>
            </Link>
          </div>
        </SheetTitle>
        <div className="no-scrollbar flex h-[calc(100vh-80px)] flex-col justify-between overflow-y-auto">
          <SheetClose asChild>
            <section className="flex h-full flex-col gap-2 pl-10">
              <NavLinks isMobileNav={true} />
            </section>
          </SheetClose>
          {user ? (
            <div className="py-6 flex items-center justify-between px-4">
              <div className="flex items-center gap-2 p-2">
                <Image
                  src={user.image ?? "/avatar1.png"}
                  alt="Profile"
                  width={100}
                  height={100}
                  className="h-10.5 w-10.5 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <h3 className="max-md:text-xs text-sm font-semibold text-foreground">
                    {user.name}
                  </h3>
                  <p className="text-xs text-muted-foreground">Admin</p>
                </div>
              </div>
              <form
                action={async () => {
                  "use server";
                  await signOut();
                }}
              >
                <Button
                  type="submit"
                  className="base-medium w-fit bg-transparent! px-4 py-3"
                >
                  <LogOut className="h-6 w-6 text-black dark:text-white" />
                </Button>
              </form>
            </div>
          ) : (
            <div className="py-6 px-10 flex flex-col gap-3">
              <Link href="/sign-in" className="w-full">
                <Button className="w-full">Login</Button>
              </Link>

              <Link href="/sign-up" className="w-full">
                <Button variant="outline" className="w-full">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
export default Mobile;

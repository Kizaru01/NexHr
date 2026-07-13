import Link from "next/link";
import Navlink from "./Navlink";
import Image from "next/image";
import { Button } from "./ui/button";
import { signOut } from "@/auth";
import { LogOut } from "lucide-react";
interface Props {
  user?: {
    id?: string;
    name?: string | null;
    image?: string | null;
  };
}
const LeftSideBar = async ({ user }: Props) => {
  const userId = user;

  return (
    <aside className="sticky left-0 top-0  bg-blue-400 max-lg:hidden lg:65 flex flex-col justify-between overflow-y-auto h-screen">
      <div className="space-y-1 pl-6">
        <Link href="/" className="cursor-pointer">
          <p className="font-bold text-6xl py-4">NexHr</p>
        </Link>

        <Navlink />
      </div>

      {userId ? (
        <div className="py-6 flex items-center justify-between px-4">
          <div className="flex items-center gap-2 p-2">
            <Image
              src={userId.image ?? "/avatar1.png"}
              alt="Profile"
              width={100}
              height={100}
              className="h-10.5 w-10.5 rounded-full object-cover"
            />
            <div className="flex flex-col">
              <h3 className="max-md:text-xs text-sm font-semibold text-foreground">
                {userId.name}
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
    </aside>
  );
};

export default LeftSideBar;

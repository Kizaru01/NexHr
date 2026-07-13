import { auth } from "@/auth";
import LeftSideBar from "@/components/LeftSideBar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;
  return (
    <div className="flex">
      <LeftSideBar user={user} />
      <main className="min-w-0 flex min-h-screen flex-1 flex-col  max-md:pb-14 bg-gray-50 overflow-y-auto px-2 sm:px-4 lg:px-10 pb-15">
        {children}
      </main>
    </div>
  );
}

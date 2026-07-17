import { auth } from "@/auth";
import LeftSideBar from "@/components/LeftSideBar";
import MobileNavigation from "@/components/navigation/MobileNavigation";
import NavigationProvider from "@/components/navigation/NavigationProvider";
import ResponsiveNavbar from "@/components/navigation/ResponsiveNavbar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  const user = session?.user;

  return (
    <NavigationProvider>
      <div className="flex min-h-screen bg-muted/30">
        <LeftSideBar user={user} />
        <div className="min-w-0 flex min-h-screen flex-1 flex-col">
          <ResponsiveNavbar />
          <main className="min-w-0 flex-1 overflow-y-auto px-4 pb-6 pt-2 sm:px-6 lg:px-8 xl:px-10 xl:py-6">
            {children}
          </main>
        </div>
        <MobileNavigation user={user} />
      </div>
    </NavigationProvider>
  );
}

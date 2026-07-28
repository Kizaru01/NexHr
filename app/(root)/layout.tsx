import { auth } from "@/auth";
import LeftSideBar from "@/components/LeftSideBar";
import MobileNavigation from "@/components/navigation/MobileNavigation";
import NavigationProvider from "@/components/navigation/NavigationProvider";
import ResponsiveNavbar from "@/components/navigation/ResponsiveNavbar";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const session = await auth();
  const user = session?.user;

  return (
    <NavigationProvider>
      <div className="flex min-h-screen bg-background">
        <LeftSideBar user={user} />
        <div className="min-w-0 flex min-h-screen flex-1 flex-col">
          <ResponsiveNavbar />
          <main className="page-container min-w-0 overflow-y-auto">
            {children}
          </main>
        </div>
        <MobileNavigation user={user} />
      </div>
    </NavigationProvider>
  );
}

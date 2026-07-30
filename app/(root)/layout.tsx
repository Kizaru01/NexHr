import { auth } from "@/auth";
import LeftSideBar from "@/components/LeftSideBar";
import MobileNavigation from "@/components/navigation/MobileNavigation";
import NavigationProvider from "@/components/navigation/NavigationProvider";
import ResponsiveNavbar from "@/components/navigation/ResponsiveNavbar";
import { getConcernUnreadCount } from "@/lib/queries/concern.queries";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const session = await auth();
  const user = session?.user;
  const concernUnreadCount = user?.id
    ? await getConcernUnreadCount(user.id)
    : 0;

  return (
    <NavigationProvider>
      <div className="flex min-h-screen bg-background">
        <LeftSideBar
          user={user}
          concernUnreadCount={concernUnreadCount}
        />
        <div className="min-w-0 flex min-h-screen flex-1 flex-col">
          <ResponsiveNavbar />
          <main className="page-container min-w-0 overflow-y-auto">
            {children}
          </main>
        </div>
        <MobileNavigation
          user={user}
          concernUnreadCount={concernUnreadCount}
        />
      </div>
    </NavigationProvider>
  );
}

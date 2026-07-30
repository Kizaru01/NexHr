import ApplicationNavigation from "@/components/navigation/ApplicationNavigation";
import DesktopSidebar from "@/components/navigation/DesktopSidebar";
import type { UserRole } from "@/types/global";

type LeftSideBarProps = {
  user?: { image?: string | null; name?: string | null; role?: UserRole };
  concernUnreadCount?: number;
};

const LeftSideBar = ({
  user,
  concernUnreadCount = 0,
}: LeftSideBarProps): React.JSX.Element => (
  <DesktopSidebar>
    <ApplicationNavigation
      user={user}
      variant="desktop"
      concernUnreadCount={concernUnreadCount}
    />
  </DesktopSidebar>
);

export default LeftSideBar;

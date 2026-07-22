import ApplicationNavigation from "@/components/navigation/ApplicationNavigation";
import DesktopSidebar from "@/components/navigation/DesktopSidebar";
import type { UserRole } from "@/types/global";

type LeftSideBarProps = {
  user?: { image?: string | null; name?: string | null; role?: UserRole };
};

const LeftSideBar = ({ user }: LeftSideBarProps): React.JSX.Element => (
  <DesktopSidebar>
    <ApplicationNavigation user={user} variant="desktop" />
  </DesktopSidebar>
);

export default LeftSideBar;

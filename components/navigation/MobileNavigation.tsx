import type { UserRole } from "@/types/global";

import ApplicationNavigation from "./ApplicationNavigation";
import MobileDrawer from "./MobileDrawer";

type MobileNavigationProps = {
  user?: { image?: string | null; name?: string | null; role?: UserRole };
  concernUnreadCount?: number;
};

export default function MobileNavigation({
  user,
  concernUnreadCount = 0,
}: MobileNavigationProps): React.JSX.Element {
  return (
    <MobileDrawer>
      <ApplicationNavigation
        user={user}
        variant="mobile"
        concernUnreadCount={concernUnreadCount}
      />
    </MobileDrawer>
  );
}

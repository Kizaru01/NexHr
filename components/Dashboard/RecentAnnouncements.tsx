import Link from "next/link";
import { ArrowUpRight, Megaphone } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { recentLeaveRequests } from "@/constants/dashboard-static";

const RecentAnnouncements = (): React.JSX.Element => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Announcements</CardTitle>
        <CardAction>
          <Link
            href="/announcements"
            className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:text-primary-hover"
          >
            View all <ArrowUpRight className="size-3.5" />
          </Link>
        </CardAction>
      </CardHeader>

      <CardContent className="space-y-1">
        {recentLeaveRequests.map((leave) => (
          <div
            key={leave.id}
            className="interactive-row flex items-center gap-3 px-2 py-1.5"
          >
            <Avatar className="size-9">
              <AvatarFallback>
                <Megaphone className="size-4 text-primary" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-[0.8125rem] font-semibold">
                {leave.employee}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {leave.leaveType} update · {leave.startDate}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentAnnouncements;

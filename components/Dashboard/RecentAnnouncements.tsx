import { recentLeaveRequests } from "@/constants/dashboard-static";

import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import Image from "next/image";
import Link from "next/link";
const RecentAnnouncements = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Announcement</CardTitle>
      </CardHeader>

      <CardContent className="space-y-1">
        {recentLeaveRequests.map((leave) => (
          <div key={leave.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarFallback>
                  {leave.employee
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <p className="font-bold">{leave.employee}</p>
                <div className="flex items-center gap-2">
                  <p className="text-muted-foreground text-sm">
                    {leave.leaveType}
                  </p>
                  <p>•</p>
                  <p className="text-muted-foreground text-sm">
                    {leave.startDate} - {leave.endDate}
                  </p>
                </div>
              </div>
            </div>
            <p>&quot;{leave.status}&quot;</p>
          </div>
        ))}
        <Link
          href="/announcements"
          className="py-4 flex gap-8 pl-4 cursor-pointer"
        >
          <p className="text-blue-500 text-lg">View All Request</p>
          <Image
            src="/icons/chevron-right.svg"
            alt="arrow"
            height={20}
            width={20}
          />
        </Link>
      </CardContent>
    </Card>
  );
};

export default RecentAnnouncements;

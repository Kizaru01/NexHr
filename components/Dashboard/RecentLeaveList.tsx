"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import StatusBadge from "@/components/hr/StatusBadge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { recentLeaveRequests } from "@/constants/dashboard-static";

const RecentLeaveList = (): React.JSX.Element => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Leave Requests</CardTitle>
        <CardAction>
          <Link
            href="/leave"
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
            className="interactive-row flex items-center justify-between gap-3 px-2 py-1.5"
          >
            <div className="flex min-w-0 items-center gap-3">
              <Avatar className="size-9">
                <AvatarFallback>
                  {leave.employee
                    .split(" ")
                    .map((name) => name[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-[0.8125rem] font-semibold">
                  {leave.employee}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {leave.leaveType} · {leave.startDate} – {leave.endDate}
                </p>
              </div>
            </div>
            <StatusBadge status={leave.status} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecentLeaveList;

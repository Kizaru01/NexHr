"use client";
import { recentLeaveRequests } from "@/constants/dashboard-static";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";
import Image from "next/image";
import Link from "next/link";
const statusVariant = {
  Pending:
    "bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-100",

  Approved: "bg-green-100 text-green-700 border-green-300 hover:bg-green-100",

  Rejected: "bg-red-100 text-red-700 border-red-300 hover:bg-red-100",
};

const RecentLeaveList = (): React.JSX.Element => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Leave Requests</CardTitle>
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
                  {" "}
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
            <p className={statusVariant[leave.status]}>
              &quot;{leave.status}&quot;
            </p>
          </div>
        ))}
        <Link href="/leave" className="py-4 flex gap-8 pl-4 cursor-pointer">
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

export default RecentLeaveList;

import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quickActions } from "@/constants/dashboard-static";

export default function QuickActions(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="hover:bg-muted transition-colors"
            >
              <div className="border border-t-lg" />
              <div className="flex items-center justify-between">
                <div className="flex flex-row p-2 gap-2">
                  <div className="flex size-4 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="text-primary size-5" />
                  </div>
                  <h3 className="font-bold">{action.title}</h3>
                  <p>•</p>
                  <p className="text-gray-500">{action.description}</p>
                </div>{" "}
              </div>
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

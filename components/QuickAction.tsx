import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { quickActions } from "@/constants/dashboard-static";

export default function QuickActions(): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-1">
        {quickActions.map((action) => {
          const Icon = action.icon;

          return (
            <Link
              key={action.title}
              href={action.href}
              className="interactive-row group flex items-center gap-3 px-2 py-1.5"
            >
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary-soft text-primary">
                <Icon className="size-4" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-[0.8125rem] font-semibold">
                  {action.title}
                </h3>
                <p className="truncate text-xs text-muted-foreground">
                  {action.description}
                </p>
              </div>
              <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          );
        })}
      </CardContent>
    </Card>
  );
}

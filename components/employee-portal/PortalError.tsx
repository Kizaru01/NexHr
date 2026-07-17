"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PortalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Card className="mx-auto mt-16 max-w-lg">
      <CardContent className="flex flex-col items-center p-10 text-center">
        <AlertTriangle className="size-9 text-destructive" />
        <h1 className="mt-4 text-xl font-semibold">We could not load this page</h1>
        <p className="mt-2 text-sm text-muted-foreground">Please try again. If the problem continues, contact your HR team.</p>
        <Button className="mt-5" onClick={reset}><RefreshCw /> Try again</Button>
      </CardContent>
    </Card>
  );
}

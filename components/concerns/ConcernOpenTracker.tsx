"use client";

import { useEffect, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";

import { markConcernOpened } from "@/lib/action/concern.action";

export default function ConcernOpenTracker({
  concernId,
}: {
  concernId: string;
}): null {
  const router = useRouter();
  const tracked = useRef(false);
  const [, startTransition] = useTransition();

  useEffect(() => {
    if (tracked.current) return;
    tracked.current = true;

    startTransition(async () => {
      const result = await markConcernOpened({ concernId });
      if (result.success) router.refresh();
    });
  }, [concernId, router]);

  return null;
}

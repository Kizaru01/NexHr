import "server-only";

import { auth } from "@/auth";
import { redirect } from "next/navigation";

export async function requireHrAdminPage(): Promise<void> {
  const session = await auth();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (session.user.role !== "admin" && session.user.role !== "hr") {
    redirect("/");
  }
}

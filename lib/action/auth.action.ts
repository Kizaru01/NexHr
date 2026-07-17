"use server";

import { signOut } from "@/auth";

export async function signOutFromApplication(): Promise<void> {
  await signOut();
}

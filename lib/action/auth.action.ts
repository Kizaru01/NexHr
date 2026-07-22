"use server";

import { signOut } from "@/auth";
import handleError from "@/lib/handler/error";
import type { ActionResponse } from "@/types/global";

export async function signOutFromApplication(): Promise<ActionResponse<null>> {
  try {
    await signOut({ redirect: false });
    return { success: true, data: null };
  } catch (error) {
    return handleError(error);
  }
}

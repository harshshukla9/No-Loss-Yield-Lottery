"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function revalidateLotteryData() {
  revalidatePath("/lottery");
}

"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";

export type NotificationRow = Database["public"]["Tables"]["notifications"]["Row"];

export async function getNotifications(): Promise<NotificationRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (error) return [];
    return (data as NotificationRow[]) || [];
  } catch {
    return [];
  }
}

export async function markNotificationAsRead(id: string): Promise<{ success?: boolean }> {
  try {
    const supabase = await createServerSupabaseClient();
    await supabase.from("notifications").update({ is_read: true }).eq("id", id);
    revalidatePath("/notifications");
    return { success: true };
  } catch {
    return { success: false };
  }
}

export async function markAllNotificationsAsRead(): Promise<{ success?: boolean }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false };

    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", user.id)
      .eq("is_read", false);

    revalidatePath("/notifications");
    return { success: true };
  } catch {
    return { success: false };
  }
}

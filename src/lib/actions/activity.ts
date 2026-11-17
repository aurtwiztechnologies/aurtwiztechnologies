"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database, Json } from "@/types/database";

export type ActivityLogRow = Database["public"]["Tables"]["activity_logs"]["Row"];

export async function logActivity(params: {
  action: string;
  entityType: string;
  entityId: string;
  divisionId?: string | null;
  metadata?: Record<string, unknown>;
}) {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from("activity_logs").insert({
      user_id: user?.id || null,
      action: params.action,
      entity_type: params.entityType,
      entity_id: params.entityId,
      division_id: params.divisionId || null,
      metadata: (params.metadata || {}) as Json,
    });
  } catch (error) {
    // Non-blocking error for audit logging
    console.error("Failed to write audit activity log:", error);
  }
}

export async function getActivityLogs(limit = 50): Promise<ActivityLogRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("activity_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) return [];
    return (data as ActivityLogRow[]) || [];
  } catch {
    return [];
  }
}

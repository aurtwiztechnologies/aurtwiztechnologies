"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import type { Database, DealStage } from "@/types/database";

export type DealRow = Database["public"]["Tables"]["deals"]["Row"];

export async function getDeals(params?: {
  divisionId?: string;
  stage?: DealStage;
}): Promise<DealRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("deals").select("*").order("created_at", { ascending: false });

    if (params?.divisionId && params.divisionId !== "all") {
      query = query.eq("division_id", params.divisionId);
    }
    if (params?.stage) {
      query = query.eq("stage", params.stage);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as DealRow[]) || [];
  } catch {
    return [];
  }
}

export async function createDeal(formData: {
  title: string;
  client_id: string;
  division_id: string;
  value: number;
  stage?: DealStage;
  expected_close_date?: string;
  probability?: number;
}): Promise<{ success?: boolean; error?: string; deal?: DealRow }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("deals")
      .insert({
        title: formData.title,
        client_id: formData.client_id,
        division_id: formData.division_id,
        value: formData.value,
        stage: formData.stage || "discovery",
        expected_close_date: formData.expected_close_date || null,
        probability: formData.probability || 20,
        assigned_to: user?.id || null,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const deal = data as DealRow;
    await logActivity({
      action: "Created sales deal opportunity",
      entityType: "deal",
      entityId: deal.id,
      divisionId: deal.division_id,
      metadata: { deal_title: deal.title, value: deal.value },
    });

    revalidatePath("/pipeline");
    revalidatePath("/dashboard");
    return { success: true, deal };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to create deal." };
  }
}

export async function updateDealStage(
  id: string,
  stage: DealStage
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const probabilityMap: Record<DealStage, number> = {
      discovery: 20,
      demo: 40,
      proposal: 60,
      negotiation: 80,
      won: 100,
      lost: 0,
    };

    const { error } = await supabase
      .from("deals")
      .update({
        stage,
        probability: probabilityMap[stage],
      })
      .eq("id", id);

    if (error) return { error: error.message };

    await logActivity({
      action: `Moved deal stage to ${stage}`,
      entityType: "deal",
      entityId: id,
    });

    revalidatePath("/pipeline");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update deal stage." };
  }
}

export async function deleteDeal(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("deals").delete().eq("id", id);
    if (error) return { error: error.message };

    await logActivity({
      action: "Deleted sales deal",
      entityType: "deal",
      entityId: id,
    });

    revalidatePath("/pipeline");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to delete deal." };
  }
}

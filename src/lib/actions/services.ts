"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import type { Database } from "@/types/database";

export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];

export async function getServices(divisionId?: string): Promise<ServiceRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("services").select("*").order("name", { ascending: true });

    if (divisionId && divisionId !== "all") {
      query = query.eq("division_id", divisionId);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as ServiceRow[]) || [];
  } catch {
    return [];
  }
}

export async function createService(formData: {
  division_id: string;
  name: string;
  description?: string;
  base_price?: number;
  currency?: string;
}): Promise<{ success?: boolean; error?: string; service?: ServiceRow }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("services")
      .insert({
        division_id: formData.division_id,
        name: formData.name,
        description: formData.description || null,
        base_price: formData.base_price || null,
        currency: formData.currency || "USD",
        status: "active",
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const service = data as ServiceRow;
    await logActivity({
      action: "Configured new service offering",
      entityType: "service",
      entityId: service.id,
      divisionId: service.division_id,
      metadata: { service_name: service.name },
    });

    revalidatePath("/services");
    return { success: true, service };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to create service." };
  }
}

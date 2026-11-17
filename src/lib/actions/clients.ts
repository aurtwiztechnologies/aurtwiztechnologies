"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import type { Database } from "@/types/database";

export type ClientRow = Database["public"]["Tables"]["clients"]["Row"];

export async function getClients(params?: {
  divisionId?: string;
  search?: string;
  status?: "active" | "inactive" | "lead" | "all";
}): Promise<ClientRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("clients").select("*").order("created_at", { ascending: false });

    if (params?.divisionId && params.divisionId !== "all") {
      query = query.eq("primary_division_id", params.divisionId);
    }
    if (params?.status && params.status !== "all") {
      query = query.eq("status", params.status as "active" | "inactive" | "lead");
    }
    if (params?.search) {
      query = query.or(
        `company_name.ilike.%${params.search}%,contact_person.ilike.%${params.search}%,email.ilike.%${params.search}%,industry.ilike.%${params.search}%`
      );
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as ClientRow[]) || [];
  } catch {
    return [];
  }
}

export async function createClient(formData: {
  company_name: string;
  contact_person: string;
  email: string;
  phone?: string;
  website?: string;
  industry?: string;
  primary_division_id: string;
}): Promise<{ success?: boolean; error?: string; client?: ClientRow }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("clients")
      .insert({
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone: formData.phone || null,
        website: formData.website || null,
        industry: formData.industry || "General Enterprise",
        primary_division_id: formData.primary_division_id,
        status: "active",
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const client = data as ClientRow;
    await logActivity({
      action: "Created client corporate account",
      entityType: "client",
      entityId: client.id,
      divisionId: client.primary_division_id,
      metadata: { company_name: client.company_name },
    });

    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { success: true, client };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to create client." };
  }
}

export async function updateClient(
  id: string,
  formData: Partial<{
    company_name: string;
    contact_person: string;
    email: string;
    phone: string;
    website: string;
    industry: string;
    status: "active" | "inactive" | "lead";
  }>
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("clients")
      .update(formData)
      .eq("id", id);

    if (error) return { error: error.message };

    await logActivity({
      action: "Updated client details",
      entityType: "client",
      entityId: id,
    });

    revalidatePath("/clients");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update client." };
  }
}

export async function deleteClient(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("clients").delete().eq("id", id);
    if (error) return { error: error.message };

    await logActivity({
      action: "Deleted client account",
      entityType: "client",
      entityId: id,
    });

    revalidatePath("/clients");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to delete client." };
  }
}

"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import type { Database, LeadStatus } from "@/types/database";

export type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

export async function getLeads(params?: {
  divisionId?: string;
  status?: LeadStatus;
  search?: string;
}): Promise<LeadRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("leads").select("*").order("created_at", { ascending: false });

    if (params?.divisionId && params.divisionId !== "all") {
      query = query.eq("division_id", params.divisionId);
    }
    if (params?.status) {
      query = query.eq("status", params.status);
    }
    if (params?.search) {
      query = query.or(
        `first_name.ilike.%${params.search}%,last_name.ilike.%${params.search}%,company_name.ilike.%${params.search}%,email.ilike.%${params.search}%`
      );
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as LeadRow[]) || [];
  } catch {
    return [];
  }
}

export async function createLead(formData: {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  company_name?: string;
  division_id: string;
  service_interest_id?: string;
  estimated_value?: number;
  source?: string;
  notes?: string;
}): Promise<{ success?: boolean; error?: string; lead?: LeadRow }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("leads")
      .insert({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || null,
        company_name: formData.company_name || null,
        division_id: formData.division_id,
        service_interest_id: formData.service_interest_id || null,
        estimated_value: formData.estimated_value || null,
        source: formData.source || "website",
        status: "new",
        assigned_to: user?.id || null,
        notes: formData.notes || null,
      })
      .select()
      .single();

    if (error) {
      return { error: error.message };
    }

    const lead = data as LeadRow;
    await logActivity({
      action: "Created prospective lead",
      entityType: "lead",
      entityId: lead.id,
      divisionId: lead.division_id,
      metadata: { lead_name: `${lead.first_name} ${lead.last_name}`, company: lead.company_name },
    });

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return { success: true, lead };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to create lead." };
  }
}

export async function updateLeadStatus(
  id: string,
  status: LeadStatus
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("leads")
      .update({ status })
      .eq("id", id);

    if (error) return { error: error.message };

    await logActivity({
      action: `Updated lead status to ${status}`,
      entityType: "lead",
      entityId: id,
    });

    revalidatePath("/leads");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update lead status." };
  }
}

/**
 * Lead-to-Client Conversion Workflow:
 * 1. Mark lead as 'converted'
 * 2. Create client account
 * 3. Create initial deal in Sales Pipeline
 */
export async function convertLeadToClient(params: {
  leadId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  industry?: string;
  divisionId: string;
  dealValue?: number;
}): Promise<{ success?: boolean; error?: string; clientId?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // 1. Create client
    const { data: client, error: clientError } = await supabase
      .from("clients")
      .insert({
        company_name: params.companyName,
        contact_person: params.contactPerson,
        email: params.email,
        phone: params.phone || null,
        industry: params.industry || "General Enterprise",
        primary_division_id: params.divisionId,
        status: "active",
      })
      .select()
      .single();

    if (clientError || !client) {
      return { error: clientError?.message || "Failed to create client account." };
    }

    const createdClient = client as Database["public"]["Tables"]["clients"]["Row"];

    // 2. Mark lead as converted
    await supabase
      .from("leads")
      .update({ status: "converted" })
      .eq("id", params.leadId);

    // 3. Create active sales deal
    await supabase.from("deals").insert({
      title: `${params.companyName} Initial Engagement`,
      client_id: createdClient.id,
      division_id: params.divisionId,
      stage: "proposal",
      value: params.dealValue || 5000,
      assigned_to: user?.id || null,
      probability: 60,
    });

    await logActivity({
      action: `Converted lead to corporate client`,
      entityType: "client",
      entityId: createdClient.id,
      divisionId: params.divisionId,
      metadata: { company_name: params.companyName, lead_id: params.leadId },
    });

    revalidatePath("/leads");
    revalidatePath("/clients");
    revalidatePath("/pipeline");
    revalidatePath("/dashboard");

    return { success: true, clientId: createdClient.id };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to convert lead to client." };
  }
}

export async function deleteLead(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) return { error: error.message };

    await logActivity({
      action: "Deleted lead record",
      entityType: "lead",
      entityId: id,
    });

    revalidatePath("/leads");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to delete lead." };
  }
}

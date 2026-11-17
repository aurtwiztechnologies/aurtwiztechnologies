"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import type { Database } from "@/types/database";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type TeamMemberRow = Database["public"]["Tables"]["team_members"]["Row"];
export type UserDivisionRow = Database["public"]["Tables"]["user_divisions"]["Row"];

export async function getProfiles(): Promise<ProfileRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("full_name", { ascending: true });

    if (error) return [];
    return (data as ProfileRow[]) || [];
  } catch {
    return [];
  }
}

export async function getTeamMembers(divisionId?: string): Promise<TeamMemberRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("team_members").select("*").order("created_at", { ascending: false });

    if (divisionId && divisionId !== "all") {
      query = query.eq("division_id", divisionId);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as TeamMemberRow[]) || [];
  } catch {
    return [];
  }
}

export async function getUserDivisions(userId?: string): Promise<UserDivisionRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("user_divisions").select("*");

    if (userId) {
      query = query.eq("user_id", userId);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as UserDivisionRow[]) || [];
  } catch {
    return [];
  }
}

export async function updateMemberAllocation(
  id: string,
  allocationPercentage: number
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("team_members")
      .update({ allocation_percentage: allocationPercentage })
      .eq("id", id);

    if (error) return { error: error.message };

    await logActivity({
      action: `Updated member allocation to ${allocationPercentage}%`,
      entityType: "team_member",
      entityId: id,
    });

    revalidatePath("/team");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update allocation." };
  }
}

/**
 * Super Admin Action: Assign User Role and Account Status
 */
export async function updateProfileRole(params: {
  userId: string;
  role: string;
  is_active: boolean;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    // Verify caller is super admin
    if (!user) return { error: "Authentication required." };
    const { data: callerProfile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const callerRole = (callerProfile as unknown as { role?: string } | null)?.role;
    if (callerRole !== "super_admin") {
      return { error: "Access Denied: Only Super Admins can alter roles." };
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        role: params.role,
        is_active: params.is_active,
      })
      .eq("id", params.userId);

    if (error) return { error: error.message };

    await logActivity({
      action: `Modified staff role to ${params.role} (active: ${params.is_active})`,
      entityType: "profile",
      entityId: params.userId,
    });

    revalidatePath("/team");
    revalidatePath("/settings");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update profile role." };
  }
}

"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import type { Database, ProjectStatus } from "@/types/database";

export type ProjectRow = Database["public"]["Tables"]["projects"]["Row"];

export async function getProjects(params?: {
  divisionId?: string;
  status?: ProjectStatus;
  search?: string;
}): Promise<ProjectRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("projects").select("*").order("created_at", { ascending: false });

    if (params?.divisionId && params.divisionId !== "all") {
      query = query.eq("division_id", params.divisionId);
    }
    if (params?.status) {
      query = query.eq("status", params.status);
    }
    if (params?.search) {
      query = query.or(`title.ilike.%${params.search}%,code.ilike.%${params.search}%`);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as ProjectRow[]) || [];
  } catch {
    return [];
  }
}

export async function createProject(formData: {
  code: string;
  title: string;
  description?: string;
  client_id: string;
  division_id: string;
  budget?: number;
  start_date?: string;
  target_completion_date?: string;
  project_manager_id?: string;
}): Promise<{ success?: boolean; error?: string; project?: ProjectRow }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data, error } = await supabase
      .from("projects")
      .insert({
        code: formData.code,
        title: formData.title,
        description: formData.description || null,
        client_id: formData.client_id,
        division_id: formData.division_id,
        status: "planning",
        budget: formData.budget || null,
        start_date: formData.start_date || new Date().toISOString().split("T")[0],
        target_completion_date: formData.target_completion_date || null,
        project_manager_id: formData.project_manager_id || user?.id || null,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const project = data as ProjectRow;
    await logActivity({
      action: "Created client project",
      entityType: "project",
      entityId: project.id,
      divisionId: project.division_id,
      metadata: { project_code: project.code, title: project.title },
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true, project };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to create project." };
  }
}

export async function updateProjectStatus(
  id: string,
  status: ProjectStatus
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("projects")
      .update({ status })
      .eq("id", id);

    if (error) return { error: error.message };

    await logActivity({
      action: `Updated project status to ${status}`,
      entityType: "project",
      entityId: id,
    });

    revalidatePath("/projects");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update project status." };
  }
}

export async function deleteProject(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) return { error: error.message };

    await logActivity({
      action: "Deleted project",
      entityType: "project",
      entityId: id,
    });

    revalidatePath("/projects");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to delete project." };
  }
}

"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import type { Database, TaskStatus, TaskPriority } from "@/types/database";

export type TaskRow = Database["public"]["Tables"]["tasks"]["Row"];

export async function getTasks(params?: {
  projectId?: string;
  divisionId?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assignedTo?: string;
}): Promise<TaskRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("tasks").select("*").order("created_at", { ascending: false });

    if (params?.projectId) {
      query = query.eq("project_id", params.projectId);
    }
    if (params?.divisionId && params.divisionId !== "all") {
      query = query.eq("division_id", params.divisionId);
    }
    if (params?.status) {
      query = query.eq("status", params.status);
    }
    if (params?.priority) {
      query = query.eq("priority", params.priority);
    }
    if (params?.assignedTo) {
      query = query.eq("assigned_to", params.assignedTo);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as TaskRow[]) || [];
  } catch {
    return [];
  }
}

export async function createTask(formData: {
  title: string;
  description?: string;
  project_id: string;
  division_id: string;
  priority?: TaskPriority;
  assigned_to?: string;
  due_date?: string;
  estimated_hours?: number;
}): Promise<{ success?: boolean; error?: string; task?: TaskRow }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("tasks")
      .insert({
        title: formData.title,
        description: formData.description || null,
        project_id: formData.project_id,
        division_id: formData.division_id,
        priority: formData.priority || "medium",
        status: "todo",
        assigned_to: formData.assigned_to || null,
        due_date: formData.due_date || null,
        estimated_hours: formData.estimated_hours || null,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const task = data as TaskRow;
    await logActivity({
      action: "Created sprint task",
      entityType: "task",
      entityId: task.id,
      divisionId: task.division_id,
      metadata: { task_title: task.title, project_id: task.project_id },
    });

    revalidatePath("/tasks");
    revalidatePath("/projects");
    return { success: true, task };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to create task." };
  }
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
  actualHours?: number
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const updatePayload: { status: TaskStatus; actual_hours?: number } = { status };
    if (actualHours !== undefined) {
      updatePayload.actual_hours = actualHours;
    }

    const { error } = await supabase
      .from("tasks")
      .update(updatePayload)
      .eq("id", id);

    if (error) return { error: error.message };

    await logActivity({
      action: `Updated task status to ${status}`,
      entityType: "task",
      entityId: id,
    });

    revalidatePath("/tasks");
    revalidatePath("/projects");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update task status." };
  }
}

export async function deleteTask(id: string): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.from("tasks").delete().eq("id", id);
    if (error) return { error: error.message };

    await logActivity({
      action: "Deleted task",
      entityType: "task",
      entityId: id,
    });

    revalidatePath("/tasks");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to delete task." };
  }
}

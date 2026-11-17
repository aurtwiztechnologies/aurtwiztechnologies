"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/types/database";

export type DivisionRow = Database["public"]["Tables"]["divisions"]["Row"];

export async function getDbDivisions(): Promise<DivisionRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("divisions")
      .select("*")
      .order("name", { ascending: true });

    if (error) return [];
    return (data as DivisionRow[]) || [];
  } catch {
    return [];
  }
}

export async function getDivisionBySlug(slug: string): Promise<DivisionRow | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("divisions")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) return null;
    return (data as DivisionRow) || null;
  } catch {
    return null;
  }
}

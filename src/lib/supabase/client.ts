import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const supabaseUrl: string = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey: string = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  if (typeof window !== "undefined") {
    console.warn(
      "Supabase credentials missing: Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are configured in .env.local"
    );
  }
}

/**
 * Shared browser-side Supabase client instance using @supabase/supabase-js.
 */
export const supabase: SupabaseClient<Database> = createSupabaseClient<Database>(
  supabaseUrl,
  supabaseAnonKey
);

/**
 * Helper to obtain a browser-side Supabase client instance.
 */
export function createClient(): SupabaseClient<Database> {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

export default supabase;

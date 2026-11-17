"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import type { Database } from "@/types/database";

export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export interface AuthActionResult {
  success?: boolean;
  error?: string;
}

/**
 * Server Action: Authenticate user with Email and Password
 */
export async function signIn(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email")?.toString().trim();
  const password = formData.get("password")?.toString();
  const redirectTo = formData.get("redirectTo")?.toString() || "/dashboard";

  if (!email || !password) {
    return { error: "Please enter both your work email and password." };
  }

  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: error.message };
  }

  if (!data.user) {
    return { error: "Authentication failed. Please verify your credentials." };
  }

  // Check if user profile is active
  try {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_active, role")
      .eq("id", data.user.id)
      .maybeSingle();

    if (profile) {
      const p = profile as unknown as { is_active: boolean; role: string };
      if (!p.is_active) {
        await supabase.auth.signOut();
        return {
          error: "Your staff account has been deactivated. Please contact your Super Administrator.",
        };
      }
    }
  } catch {
    // If profiles table is not yet migrated, allow auth to proceed during setup
  }

  redirect(redirectTo);
}

/**
 * Server Action: Sign out of active session
 */
export async function signOut(): Promise<void> {
  const supabase = await createServerSupabaseClient();
  await supabase.auth.signOut();
  redirect("/login");
}

/**
 * Server Action: Request Password Recovery Email
 */
export async function requestPasswordReset(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const email = formData.get("email")?.toString().trim();

  if (!email) {
    return { error: "Please enter your work email address." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/auth/callback?next=/reset-password`,
  });

  if (error) {
    return { error: error.message };
  }

  return {
    success: true,
  };
}

/**
 * Server Action: Set new password
 */
export async function updatePassword(
  prevState: AuthActionResult | null,
  formData: FormData
): Promise<AuthActionResult> {
  const password = formData.get("password")?.toString();
  const confirmPassword = formData.get("confirmPassword")?.toString();

  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters long." };
  }

  if (password !== confirmPassword) {
    return { error: "Passwords do not match." };
  }

  const supabase = await createServerSupabaseClient();
  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { error: error.message };
  }

  redirect("/dashboard");
}

/**
 * Retrieve current logged-in user profile from Supabase
 */
export async function getCurrentUserProfile(): Promise<{
  user: { id: string; email: string } | null;
  profile: ProfileRow | null;
}> {
  const supabase = await createServerSupabaseClient();
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { user: null, profile: null };

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    return {
      user: { id: user.id, email: user.email || "" },
      profile: profile || null,
    };
  } catch {
    return { user: null, profile: null };
  }
}

/**
 * Server Action: Update self profile
 */
export async function updateUserProfile(data: {
  full_name?: string;
  phone?: string;
}): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "Not authenticated" };

    const { error } = await supabase
      .from("profiles")
      .update({
        ...(data.full_name ? { full_name: data.full_name } : {}),
        phone: data.phone || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) return { error: error.message };
    revalidatePath("/settings");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update profile." };
  }
}

"use client";

import React from "react";
import { useAuth } from "@/components/providers/auth-provider";
import type { SystemRole } from "@/config/roles";

interface RoleGuardProps {
  allowedRoles: SystemRole[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Conditionally renders UI elements based on the active user's role.
 * Super Admin always passes role checks.
 */
export function RoleGuard({
  allowedRoles,
  children,
  fallback = null,
}: RoleGuardProps) {
  const { role, isLoading } = useAuth();

  if (isLoading) return null;

  // Super Admin has universal permission
  if (role === "super_admin" || allowedRoles.includes(role)) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
}

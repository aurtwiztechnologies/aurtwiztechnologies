import type { SystemRole } from "@/config/roles";

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string;
  title: string;
  role: SystemRole;
  divisionId?: string;
  divisionName?: string;
  createdAt: string;
  status: "active" | "invited" | "suspended";
}

export interface AuthSession {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}


"use client";

import React, { useState, useTransition } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BRAND_CONFIG } from "@/config/brand";
import { DIVISIONS } from "@/config/divisions";
import {
  Database,
  Building,
  CheckCircle2,
  Lock,
  User,
  Shield,
  Save,
  KeyRound,
  Check,
} from "lucide-react";
import { updateUserProfile } from "@/lib/actions/auth";
import type { ProfileRow } from "@/lib/actions/team";
import { SYSTEM_ROLES } from "@/config/roles";

interface SettingsClientProps {
  initialProfile: ProfileRow | null;
  userEmail: string;
}

export function SettingsClient({ initialProfile, userEmail }: SettingsClientProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "architecture" | "security">("profile");
  const [profile, setProfile] = useState<ProfileRow | null>(initialProfile);
  const [fullName, setFullName] = useState(initialProfile?.full_name || "");
  const [phone, setPhone] = useState(initialProfile?.phone || "");
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveSuccess(false);
    setSaveError("");
    startTransition(async () => {
      const res = await updateUserProfile({ full_name: fullName, phone });
      if (res.error) {
        setSaveError(res.error);
      } else {
        setSaveSuccess(true);
        if (profile) {
          setProfile({ ...profile, full_name: fullName, phone: phone || null });
        }
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    });
  };

  const roleConfig = profile?.role && profile.role in SYSTEM_ROLES
    ? SYSTEM_ROLES[profile.role as keyof typeof SYSTEM_ROLES]
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings & System Configuration"
        description="User profile management, role credentials, security parameters, and single-company architecture."
        breadcrumbs={[{ label: "System" }, { label: "Settings", current: true }]}
        badge={
          <Badge variant="outline" className="font-mono text-xs">
            v{BRAND_CONFIG.version}
          </Badge>
        }
      />

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab("profile")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "profile"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <User className="h-4 w-4" />
          My Profile & Role
        </button>
        <button
          onClick={() => setActiveTab("architecture")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "architecture"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Building className="h-4 w-4" />
          Company & Database Architecture
        </button>
        <button
          onClick={() => setActiveTab("security")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "security"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Lock className="h-4 w-4" />
          Security & Access Policy
        </button>
      </div>

      {/* TAB 1: USER PROFILE */}
      {activeTab === "profile" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Personal Profile Details</CardTitle>
                <CardDescription className="text-xs">
                  Update your contact details visible to team members and on generated invoices.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileSave} className="space-y-4">
                  {saveSuccess && (
                    <div className="p-3 text-xs rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center gap-2">
                      <Check className="h-4 w-4" />
                      Profile details successfully updated.
                    </div>
                  )}
                  {saveError && (
                    <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                      {saveError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Full Name
                      </label>
                      <Input
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Email Address
                      </label>
                      <Input
                        disabled
                        value={userEmail || profile?.email || "staff@aurtwiz.com"}
                        className="opacity-60 cursor-not-allowed bg-zinc-950"
                      />
                      <span className="text-[10px] text-zinc-500 mt-1 block">
                        Email managed through Supabase Auth
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Direct Phone / Contact
                      </label>
                      <Input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-zinc-400 mb-1">
                        Job Title
                      </label>
                      <Input
                        disabled
                        value={profile?.job_title || "Staff Member"}
                        className="opacity-60 cursor-not-allowed bg-zinc-950"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-4 border-t border-zinc-800">
                    <Button type="submit" disabled={isPending} className="gap-2">
                      <Save className="h-4 w-4" />
                      {isPending ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs uppercase tracking-wider font-medium">RBAC Status</span>
                </div>
                <CardTitle className="text-base">Assigned Role</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950/60">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-200">
                      {roleConfig?.name || profile?.role || "Staff"}
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${roleConfig?.badgeColor || ""}`}>
                      {profile?.role}
                    </Badge>
                  </div>
                  <p className="text-xs text-zinc-400">
                    {roleConfig?.description || "Single-company authenticated profile."}
                  </p>
                </div>

                <div className="text-[11px] text-zinc-500 font-mono space-y-1">
                  <span className="block text-zinc-400 font-semibold">Permissions:</span>
                  <div>{roleConfig?.permissions.join(", ") || "General"}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 2: COMPANY ARCHITECTURE */}
      {activeTab === "architecture" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <Building className="h-4 w-4 text-indigo-400" />
                  <span className="text-xs uppercase tracking-wider font-medium">Company Profile</span>
                </div>
                <CardTitle className="text-base">Aurtwiz Technologies Identity</CardTitle>
                <CardDescription className="text-xs">
                  Single-company operating system configuration. Non-multi-tenant enterprise setup.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-500 block text-[11px]">Company Name</span>
                    <span className="font-semibold text-zinc-200 mt-0.5 block">{BRAND_CONFIG.companyName}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-500 block text-[11px]">System Codename</span>
                    <span className="font-semibold text-zinc-200 mt-0.5 block">{BRAND_CONFIG.systemName}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-500 block text-[11px]">Platform Architecture</span>
                    <span className="font-semibold text-zinc-200 mt-0.5 block">{BRAND_CONFIG.mode}</span>
                  </div>
                  <div className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800">
                    <span className="text-zinc-500 block text-[11px]">Internal Ops Channel</span>
                    <span className="font-semibold text-zinc-200 mt-0.5 block">{BRAND_CONFIG.supportEmail}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center gap-2 text-zinc-400 mb-1">
                  <Database className="h-4 w-4 text-blue-400" />
                  <span className="text-xs uppercase tracking-wider font-medium">Database Layer Preparation</span>
                </div>
                <CardTitle className="text-base">Supabase PostgreSQL Readiness</CardTitle>
                <CardDescription className="text-xs">
                  Environment configuration, client/server client instances, and Row-Level Security structure.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span className="font-medium text-zinc-200">Browser Supabase Client</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      src/lib/supabase/client.ts
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 pl-6">
                    Uses public anonymous key; connects securely to Supabase Auth & Realtime.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span className="font-medium text-zinc-200">Server Supabase Client</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      src/lib/supabase/server.ts
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 pl-6">
                    Handles cookies and SSR session verification for Server Components & Server Actions.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span className="font-medium text-zinc-200">Admin Privileged Client</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      src/lib/supabase/admin.ts
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 pl-6">
                    Protected with runtime check: Throws immediately if accessed in browser context.
                  </p>
                </div>

                <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/80 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                      <span className="font-medium text-zinc-200">Full Database DDL & Schema Migration</span>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                      supabase/migrations/20261116153000_aurtwiz_core_schema.sql
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 pl-6">
                    Contains all 21 tables, foreign keys, triggers, enum types, and RLS policies.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-semibold">Active Divisions Mapped</CardTitle>
                <CardDescription className="text-xs">
                  Registered business units (7).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {DIVISIONS.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-2 rounded-lg bg-zinc-950/60 border border-zinc-800 text-xs"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: d.color }}
                      />
                      <span className="text-zinc-200 truncate">{d.shortName}</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">{d.code}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* TAB 3: SECURITY PROTOCOLS */}
      {activeTab === "security" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2 text-zinc-400 mb-1">
              <Lock className="h-4 w-4 text-emerald-400" />
              <span className="text-xs uppercase tracking-wider font-medium">Security Protocols</span>
            </div>
            <CardTitle className="text-base">Zero-Trust & Data Isolation Protocols</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs text-zinc-400 leading-relaxed">
            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60 space-y-1">
              <div className="font-semibold text-zinc-200">1. Service Role Key Isolation</div>
              <p>The Service Role secret key is strictly evaluated in server contexts only. Any client-side evaluation immediately raises a security exception.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60 space-y-1">
              <div className="font-semibold text-zinc-200">2. Row Level Security on all 21 Tables</div>
              <p>PostgreSQL Row Level Security policies isolate finance ledgers to Super Admins and Finance Managers, division tasks to their respective heads, and personal queues to assigned staff.</p>
            </div>
            <div className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60 space-y-1">
              <div className="font-semibold text-zinc-200">3. Immutable Activity Logging</div>
              <p>Critical business operations (lead conversion, client registration, deal advancement, invoice creation, role modification) trigger automated entries in <code className="text-zinc-300">public.activity_logs</code>.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

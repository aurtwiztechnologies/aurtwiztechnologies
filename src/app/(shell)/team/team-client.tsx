"use client";

import React, { useState, useTransition } from "react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Modal } from "@/components/ui/modal";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Users,
  Shield,
  Search,
  Mail,
  Phone,
  Briefcase,
  Layers,
  Edit,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { SYSTEM_ROLES } from "@/config/roles";
import {
  updateProfileRole,
  updateMemberAllocation,
  type ProfileRow,
  type UserDivisionRow,
  type TeamMemberRow,
} from "@/lib/actions/team";
import type { DivisionRow } from "@/lib/actions/divisions";
import type { SystemRole } from "@/types/database";

interface TeamClientProps {
  initialProfiles: ProfileRow[];
  userDivisions: UserDivisionRow[];
  teamMembers: TeamMemberRow[];
  divisions: DivisionRow[];
}

export function TeamClient({
  initialProfiles,
  userDivisions,
  teamMembers,
  divisions,
}: TeamClientProps) {
  const [profiles, setProfiles] = useState<ProfileRow[]>(initialProfiles);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Role Edit Modal
  const [selectedProfile, setSelectedProfile] = useState<ProfileRow | null>(null);
  const [selectedNewRole, setSelectedNewRole] = useState<SystemRole>("team_member");
  const [roleUpdateError, setRoleUpdateError] = useState("");

  const filteredProfiles = profiles.filter((p) => {
    const matchesSearch =
      searchTerm === "" ||
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.job_title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDivision =
      selectedDivision === "all" || p.primary_division_id === selectedDivision;

    const matchesRole =
      selectedRole === "all" || p.role === selectedRole;

    return matchesSearch && matchesDivision && matchesRole;
  });

  const getDivisionName = (divId: string | null) => {
    if (!divId) return "Company Wide";
    const d = divisions.find((div) => div.id === divId);
    return d ? d.short_name || d.name : "Division";
  };

  const getSecondaryDivisions = (userId: string) => {
    const memberships = userDivisions.filter((ud) => ud.user_id === userId && !ud.is_primary);
    return memberships.map((ud) => getDivisionName(ud.division_id));
  };

  const getRoleBadge = (role: string) => {
    const config = SYSTEM_ROLES[role as SystemRole];
    return (
      <Badge variant="outline" className={`text-xs ${config?.badgeColor || ""}`}>
        {config?.name || role}
      </Badge>
    );
  };

  const handleRoleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProfile) return;
    setRoleUpdateError("");
    startTransition(async () => {
      const res = await updateProfileRole({
        userId: selectedProfile.id,
        role: selectedNewRole,
        is_active: selectedProfile.is_active,
      });
      if (res.error) {
        setRoleUpdateError(res.error);
      } else {
        setProfiles((prev) =>
          prev.map((p) => (p.id === selectedProfile.id ? { ...p, role: selectedNewRole } : p))
        );
        setSelectedProfile(null);
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Team Directory"
        description="Internal corporate directory, division leadership, role assignments, and access permissions for Aurtwiz Technologies."
        breadcrumbs={[{ label: "Team" }, { label: "Team Members", current: true }]}
        badge={
          <Badge variant="default" className="font-mono text-xs">
            Single-Company Staff
          </Badge>
        }
      />

      {/* Role-Based Hierarchy Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 text-zinc-400 mb-1">
            <Shield className="h-4 w-4 text-emerald-400" />
            <span className="text-xs uppercase tracking-wider font-medium">Security & Role Architecture</span>
          </div>
          <CardTitle className="text-base">Role-Based Access Control (RBAC)</CardTitle>
          <CardDescription className="text-xs">
            The 6 enterprise roles controlling access across the 7 business divisions of Aurtwiz Technologies.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {Object.values(SYSTEM_ROLES).map((role) => (
              <div
                key={role.id}
                className="p-3.5 rounded-lg border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-zinc-200">
                      {role.name}
                    </span>
                    <Badge variant="outline" className={`text-[10px] ${role.badgeColor}`}>
                      {role.id}
                    </Badge>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">
                    {role.description}
                  </p>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-800/60 text-[10px] text-zinc-500 font-mono">
                  <span>Scope: {role.permissions.join(", ")}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Total Staff Members</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">{profiles.length}</div>
          <p className="text-xs text-zinc-500 mt-1">Onboarded user accounts</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Active Accounts</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            {profiles.filter((p) => p.is_active).length}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Permitted system access</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Leadership & PMs</span>
            <Briefcase className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            {profiles.filter((p) => p.role === "division_head" || p.role === "project_manager" || p.role === "super_admin").length}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Management & supervision</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Multi-Division Staff</span>
            <Layers className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            {new Set(userDivisions.filter((ud) => !ud.is_primary).map((ud) => ud.user_id)).size}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Cross-functional allocations</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by name, email, or job title..."
            className="pl-9 bg-zinc-900/50 border-zinc-800 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-56">
          <Select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="bg-zinc-900/50 border-zinc-800 text-sm"
          >
            <option value="all">All Divisions</option>
            {divisions.map((div) => (
              <option key={div.id} value={div.id}>
                {div.short_name || div.name}
              </option>
            ))}
          </Select>
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-zinc-900/50 border-zinc-800 text-sm"
          >
            <option value="all">All Roles</option>
            {Object.values(SYSTEM_ROLES).map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Staff Directory Table */}
      {filteredProfiles.length === 0 ? (
        <EmptyState
          icon={Users}
          title={profiles.length === 0 ? "No Staff Profiles Registered" : "No Matching Team Members"}
          description={
            profiles.length === 0
              ? "New profiles are automatically created when employees sign up or authenticate with Supabase Auth."
              : "Try adjusting your search query or role filters."
          }
        />
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Team Member</TableHead>
                <TableHead>System Role</TableHead>
                <TableHead>Primary Division</TableHead>
                <TableHead>Cross-Division Allocations</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProfiles.map((profile) => {
                const secondaryDivs = getSecondaryDivisions(profile.id);
                return (
                  <TableRow key={profile.id}>
                    <TableCell>
                      <div className="font-semibold text-zinc-100">{profile.full_name}</div>
                      <div className="text-xs text-zinc-400 font-mono mt-0.5">{profile.job_title}</div>
                      <div className="flex items-center gap-3 text-xs text-zinc-400 mt-1">
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {profile.email}
                        </span>
                        {profile.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {profile.phone}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{getRoleBadge(profile.role)}</TableCell>
                    <TableCell>
                      <span className="text-xs font-medium px-2 py-0.5 rounded border border-zinc-800 bg-zinc-800/40 text-zinc-300">
                        {getDivisionName(profile.primary_division_id)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {secondaryDivs.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {secondaryDivs.map((d, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400"
                            >
                              {d}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-600 italic">None</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {profile.is_active ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-400">
                          <CheckCircle2 className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          Deactivated
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedProfile(profile);
                          setSelectedNewRole(profile.role as SystemRole);
                          setRoleUpdateError("");
                        }}
                        className="h-8 gap-1.5 text-xs text-zinc-300"
                      >
                        <Edit className="h-3 w-3" />
                        Modify Role
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ROLE MODIFICATION MODAL */}
      <Modal
        isOpen={!!selectedProfile}
        onClose={() => setSelectedProfile(null)}
        title="Modify Staff Role & Permissions"
        description={`Update role assignment for ${selectedProfile?.full_name}. This updates Row Level Security access.`}
        size="md"
      >
        <form onSubmit={handleRoleSubmit} className="space-y-4">
          {roleUpdateError && (
            <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {roleUpdateError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Select System Role *</label>
            <Select
              value={selectedNewRole}
              onChange={(e) => setSelectedNewRole(e.target.value as SystemRole)}
              required
            >
              {Object.values(SYSTEM_ROLES).map((role) => (
                <option key={role.id} value={role.id}>
                  {role.name} — {role.description}
                </option>
              ))}
            </Select>
          </div>

          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 space-y-1">
            <div className="font-semibold text-zinc-200">
              Granted Permissions for {SYSTEM_ROLES[selectedNewRole as SystemRole]?.name}:
            </div>
            <div className="font-mono text-zinc-400 text-[11px]">
              {SYSTEM_ROLES[selectedNewRole as SystemRole]?.permissions.join(", ")}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setSelectedProfile(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Updating..." : "Save Role Assignment"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export type SystemRole =
  | "super_admin"
  | "division_head"
  | "project_manager"
  | "finance_manager"
  | "sales_executive"
  | "team_member";

export interface RoleDefinition {
  id: SystemRole;
  name: string;
  description: string;
  badgeColor: string;
  permissions: string[];
}

export const SYSTEM_ROLES: Record<SystemRole, RoleDefinition> = {
  super_admin: {
    id: "super_admin",
    name: "Super Admin",
    description: "Complete access across all 7 business divisions, finance, users, and system configuration.",
    badgeColor: "bg-red-500/10 text-red-400 border-red-500/20",
    permissions: ["*"],
  },
  division_head: {
    id: "division_head",
    name: "Division Head",
    description: "Full oversight of designated business division, its services, projects, tasks, team, and reports.",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    permissions: [
      "division:read",
      "division:write",
      "projects:all_division",
      "tasks:all_division",
      "team:division",
      "leads:division",
      "reports:division",
    ],
  },
  project_manager: {
    id: "project_manager",
    name: "Project Manager",
    description: "Manages projects, task allocations, milestone deliverables, and client communications.",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    permissions: [
      "projects:read",
      "projects:write",
      "tasks:read",
      "tasks:write",
      "clients:read",
    ],
  },
  finance_manager: {
    id: "finance_manager",
    name: "Finance Manager",
    description: "Oversight of client invoices, company expenses, incoming payments, and accounting audits.",
    badgeColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    permissions: [
      "finance:read",
      "finance:write",
      "invoices:manage",
      "payments:manage",
      "expenses:manage",
      "reports:financial",
    ],
  },
  sales_executive: {
    id: "sales_executive",
    name: "Sales Executive",
    description: "Manages prospect leads, deal pipelines, client onboarding, and outbound opportunities.",
    badgeColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    permissions: [
      "leads:read",
      "leads:write",
      "clients:read",
      "clients:write",
      "pipeline:read",
      "pipeline:write",
    ],
  },
  team_member: {
    id: "team_member",
    name: "Team Member",
    description: "Executes assigned tasks, project deliverables, and internal team collaboration.",
    badgeColor: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    permissions: [
      "tasks:assigned",
      "projects:assigned",
      "profile:own",
    ],
  },
};


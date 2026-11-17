"use client";

import React from "react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Layers,
  Users,
  FolderKanban,
  CheckSquare,
  Building2,
  TrendingUp,
  ArrowRight,
  Shield,
  Plus,
} from "lucide-react";
import Link from "next/link";
import type { BusinessDivision } from "@/config/divisions";
import type { ProjectRow } from "@/lib/actions/projects";
import type { LeadRow } from "@/lib/actions/leads";
import type { TaskRow } from "@/lib/actions/tasks";
import type { ClientRow } from "@/lib/actions/clients";

interface DivisionWorkspaceClientProps {
  division: BusinessDivision;
  projects: ProjectRow[];
  leads: LeadRow[];
  tasks: TaskRow[];
  clients: ClientRow[];
}

export function DivisionWorkspaceClient({
  division,
  projects,
  leads,
  tasks,
  clients,
}: DivisionWorkspaceClientProps) {
  const activeProjects = projects.filter(
    (p) => p.status === "in_progress" || p.status === "planning" || p.status === "review"
  );
  const activeLeads = leads.filter(
    (l) => l.status !== "converted" && l.status !== "lost"
  );
  const pendingTasks = tasks.filter(
    (t) => t.status === "todo" || t.status === "in_progress"
  );

  return (
    <div className="space-y-6">
      {/* Division Page Header */}
      <PageHeader
        title={division.name}
        description={division.description}
        breadcrumbs={[
          { label: "Divisions", href: "/divisions" },
          { label: division.shortName, current: true },
        ]}
        badge={
          <Badge variant="outline" className="font-mono text-xs gap-1.5 px-2.5">
            <span
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: division.color }}
            />
            {division.code} • Division Hub
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/services">
              <Button variant="outline" size="sm" className="text-xs">
                All 31 Services
              </Button>
            </Link>
            <Link href="/leads">
              <Button size="sm" className="text-xs gap-1.5">
                <Plus className="h-3.5 w-3.5" />
                Add Division Lead
              </Button>
            </Link>
          </div>
        }
      />

      {/* Division KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Division Services"
          value={division.services.length}
          change="Standardized"
          trend="up"
          divisionCode={division.code}
          icon={<Layers className="h-4 w-4" />}
          description="Standardized offerings in this business line"
        />
        <StatCard
          title="Active Deliverables"
          value={activeProjects.length}
          change={`${projects.length} Total`}
          trend="up"
          divisionCode={division.code}
          icon={<FolderKanban className="h-4 w-4 text-blue-400" />}
          description="Projects scoped in this division"
        />
        <StatCard
          title="Inbound Leads"
          value={activeLeads.length}
          change={`${leads.length} Cumulative`}
          trend="up"
          divisionCode={division.code}
          icon={<TrendingUp className="h-4 w-4 text-emerald-400" />}
          description="Prospects routed to this division"
        />
        <StatCard
          title="Sprint Backlog"
          value={pendingTasks.length}
          change="In Execution"
          trend="neutral"
          divisionCode={division.code}
          icon={<CheckSquare className="h-4 w-4 text-amber-400" />}
          description="Active queued tasks"
        />
      </div>

      {/* Services in this Division */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-semibold">
                Services & Capabilities
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                Standardized offerings managed under {division.name}.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="font-mono text-xs">
              {division.services.length} Offerings
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {division.services.map((service) => (
              <div
                key={service.id}
                className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/60 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-zinc-200">
                      {service.name}
                    </span>
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  </div>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {service.description}
                  </p>
                </div>
                <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500 font-mono">
                  <span>Status: Active</span>
                  <span className="text-zinc-400">{division.code}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Division Operations Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Projects in Division */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FolderKanban className="h-4 w-4 text-blue-400" />
                <CardTitle className="text-base">Active Deliverables</CardTitle>
              </div>
              <Link href="/projects" className="text-xs text-zinc-400 hover:text-zinc-200">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {projects.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500 italic">
                No active projects for {division.name} yet.
              </div>
            ) : (
              <div className="space-y-2">
                {projects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="font-mono text-xs text-blue-400 font-semibold">
                        {project.code}
                      </div>
                      <div className="text-sm font-medium text-zinc-200">{project.title}</div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono text-zinc-400 capitalize">
                        {project.status.replace("_", " ")}
                      </span>
                      {project.budget && (
                        <div className="text-xs font-bold text-zinc-200">
                          ${project.budget.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Division Inbound Leads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <CardTitle className="text-base">Inbound Lead Queue</CardTitle>
              </div>
              <Link href="/leads" className="text-xs text-zinc-400 hover:text-zinc-200">
                View All
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {leads.length === 0 ? (
              <div className="text-center py-8 text-xs text-zinc-500 italic">
                No prospective leads in {division.name} queue.
              </div>
            ) : (
              <div className="space-y-2">
                {leads.slice(0, 5).map((lead) => (
                  <div
                    key={lead.id}
                    className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-950/40 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-semibold text-zinc-200">
                        {lead.first_name} {lead.last_name}
                      </div>
                      <div className="text-xs text-zinc-400">{lead.company_name || lead.email}</div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline" className="text-[10px] capitalize">
                        {lead.status.replace("_", " ")}
                      </Badge>
                      {lead.estimated_value && (
                        <div className="text-xs font-bold text-emerald-400 mt-1">
                          ${lead.estimated_value.toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Leadership & Staffing Note */}
      <Card className="border-zinc-800/80 bg-zinc-950/40">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-indigo-400 shrink-0" />
            <div>
              <div className="text-sm font-semibold text-zinc-200">
                {division.leadRole} Oversight
              </div>
              <div className="text-xs text-zinc-400">
                Division Heads manage project assignments, task sprints, and client proposals scoped to {division.name}.
              </div>
            </div>
          </div>
          <Link href="/team">
            <Button variant="outline" size="sm" className="text-xs shrink-0">
              View Division Staff
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}

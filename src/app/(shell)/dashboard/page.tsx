import React from "react";
import { PageHeader } from "@/components/common/page-header";
import { StatCard } from "@/components/common/stat-card";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DIVISIONS } from "@/config/divisions";
import { BRAND_CONFIG } from "@/config/brand";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getActivityLogs } from "@/lib/actions/activity";
import {
  Layers,
  TrendingUp,
  FolderKanban,
  CheckCircle2,
  Shield,
  Users,
  CreditCard,
  Building2,
  Clock,
  ArrowRight,
  Activity,
  Plus,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const totalServices = DIVISIONS.reduce((acc, d) => acc + d.services.length, 0); // Exactly 31 services

  let clientsCount = 0;
  let leadsCount = 0;
  let projectsCount = 0;
  let pipelineTotalValue = 0;
  let activeTasksCount = 0;

  try {
    const supabase = await createServerSupabaseClient();

    const [clientsRes, leadsRes, projectsRes, dealsRes, tasksRes] = await Promise.all([
      supabase.from("clients").select("*", { count: "exact", head: true }),
      supabase.from("leads").select("*", { count: "exact", head: true }).neq("status", "lost"),
      supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "in_progress"),
      supabase.from("deals").select("value"),
      supabase.from("tasks").select("*", { count: "exact", head: true }).neq("status", "done"),
    ]);

    clientsCount = clientsRes.count || 0;
    leadsCount = leadsRes.count || 0;
    projectsCount = projectsRes.count || 0;
    activeTasksCount = tasksRes.count || 0;

    if (dealsRes.data) {
      pipelineTotalValue = dealsRes.data.reduce((acc, deal) => acc + Number(deal.value || 0), 0);
    }
  } catch {
    // Graceful fallback when tables are fresh
  }

  const recentLogs = await getActivityLogs(5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <PageHeader
        title="Executive Overview"
        description={`Central operational command for ${BRAND_CONFIG.companyName}. Real-time metrics across all 7 business divisions.`}
        breadcrumbs={[{ label: "Overview" }, { label: "Dashboard", current: true }]}
        badge={
          <Badge variant="success" className="gap-1.5 font-mono text-[11px] px-2.5 py-0.5">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Enterprise OS
          </Badge>
        }
        actions={
          <div className="flex items-center gap-2">
            <Link href="/leads">
              <Button size="sm" variant="outline" className="text-xs">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Add Lead
              </Button>
            </Link>
            <Link href="/divisions">
              <Button size="sm" variant="default" className="text-xs">
                <Layers className="h-3.5 w-3.5 mr-1" />
                Explore 7 Divisions
              </Button>
            </Link>
          </div>
        }
      />

      {/* High-level Metric Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Clients"
          value={clientsCount.toString()}
          change={`${leadsCount} Inbound Leads`}
          trend="up"
          icon={<Building2 className="h-4 w-4 text-indigo-400" />}
          description="Corporate accounts across all 7 divisions"
        />
        <StatCard
          title="Pipeline Volume"
          value={`$${pipelineTotalValue.toLocaleString()}`}
          change="Open Deals"
          trend="up"
          icon={<TrendingUp className="h-4 w-4 text-amber-400" />}
          description="Active opportunities in sales funnel"
        />
        <StatCard
          title="Active Projects"
          value={projectsCount.toString()}
          change={`${activeTasksCount} Pending Tasks`}
          trend="neutral"
          icon={<FolderKanban className="h-4 w-4 text-blue-400" />}
          description="Deliverables currently in production"
        />
        <StatCard
          title="Services Catalog"
          value={totalServices.toString()}
          change="7 Divisions"
          trend="up"
          icon={<Layers className="h-4 w-4 text-emerald-400" />}
          description="Standardized service offerings"
        />
      </div>

      {/* Grid: 7 Divisions & Recent Activity Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Divisions Cards (2 columns on lg) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-zinc-100">
                Aurtwiz Business Divisions
              </h2>
              <p className="text-xs text-zinc-400">
                Unified multi-division enterprise operations under Aurtwiz Technologies.
              </p>
            </div>
            <Link
              href="/divisions"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium inline-flex items-center gap-1 transition-colors"
            >
              View Hub <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {DIVISIONS.map((division) => (
              <Link
                key={division.slug}
                href={`/divisions/${division.slug}`}
                className="group block p-4 rounded-xl border border-zinc-850 bg-zinc-900/60 hover:bg-zinc-900 hover:border-zinc-700 transition-all shadow-sm"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: division.color }}
                    />
                    <span className="font-semibold text-sm text-zinc-100 group-hover:text-indigo-400 transition-colors">
                      {division.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="font-mono text-[10px] px-1.5 py-0">
                    {division.code}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-400 line-clamp-2 mb-3">
                  {division.description}
                </p>
                <div className="flex items-center justify-between text-[11px] text-zinc-400 border-t border-zinc-800/80 pt-2.5">
                  <span className="font-medium text-zinc-300">
                    {division.services.length} Standard Services
                  </span>
                  <span className="text-indigo-400 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-0.5">
                    Launch Hub <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right Sidebar: Recent Activity Audit Trail */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold text-zinc-100 flex items-center gap-2">
              <Activity className="h-4 w-4 text-indigo-400" />
              Live Audit Log
            </h2>
            <Link
              href="/reports"
              className="text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              Full Log
            </Link>
          </div>

          <Card className="border-zinc-800 bg-zinc-900/60">
            <CardHeader className="pb-3 border-b border-zinc-800/80">
              <CardTitle className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                System Activity Feed
              </CardTitle>
              <CardDescription className="text-xs text-zinc-400">
                Immutable audit records for operational events.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-3">
              {recentLogs.length === 0 ? (
                <div className="py-8 text-center text-xs text-zinc-400 space-y-1">
                  <Clock className="h-6 w-6 text-zinc-600 mx-auto mb-2" />
                  <p className="font-medium text-zinc-400">No activity logged yet</p>
                  <p className="text-[11px] text-zinc-400">Actions like lead creation and deal progression appear here.</p>
                </div>
              ) : (
                <div className="space-y-3.5">
                  {recentLogs.map((log) => (
                    <div key={log.id} className="flex items-start gap-2.5 text-xs">
                      <div className="h-2 w-2 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-zinc-200 font-medium truncate">{log.action}</p>
                        <div className="flex items-center gap-2 text-[10px] text-zinc-400 mt-0.5">
                          <span className="capitalize">{log.entity_type}</span>
                          <span>•</span>
                          <span>{new Date(log.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Company Security Callout */}
          <div className="p-3.5 rounded-xl border border-zinc-800/80 bg-zinc-950/60 space-y-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-200">
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Zero-Trust Enterprise OS</span>
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Row Level Security is active across all 21 tables. Role-based permissions enforce division-level isolation and finance safeguards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

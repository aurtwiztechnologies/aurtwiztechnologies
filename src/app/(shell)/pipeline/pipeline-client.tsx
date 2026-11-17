"use client";

import React, { useState, useTransition } from "react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Modal } from "@/components/ui/modal";
import {
  DollarSign,
  TrendingUp,
  Percent,
  Plus,
  Calendar,
  Building2,
  Trash2,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import {
  createDeal,
  updateDealStage,
  deleteDeal,
  type DealRow,
} from "@/lib/actions/deals";
import type { ClientRow } from "@/lib/actions/clients";
import type { DivisionRow } from "@/lib/actions/divisions";
import type { DealStage } from "@/types/database";

interface PipelineClientProps {
  initialDeals: DealRow[];
  clients: ClientRow[];
  divisions: DivisionRow[];
}

const STAGES: { id: DealStage; label: string; color: string }[] = [
  { id: "discovery", label: "Discovery", color: "border-blue-500/40 text-blue-400" },
  { id: "demo", label: "Demo / Scoping", color: "border-cyan-500/40 text-cyan-400" },
  { id: "proposal", label: "Proposal", color: "border-purple-500/40 text-purple-400" },
  { id: "negotiation", label: "Negotiation", color: "border-amber-500/40 text-amber-400" },
  { id: "won", label: "Closed Won", color: "border-emerald-500/40 text-emerald-400" },
  { id: "lost", label: "Closed Lost", color: "border-zinc-700 text-zinc-500" },
];

export function PipelineClient({ initialDeals, clients, divisions }: PipelineClientProps) {
  const [deals, setDeals] = useState<DealRow[]>(initialDeals);
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    client_id: clients[0]?.id || "",
    division_id: divisions[0]?.id || "",
    value: "10000",
    stage: "discovery" as DealStage,
    expected_close_date: "",
    probability: "20",
  });

  // Filter deals
  const filteredDeals = deals.filter(
    (d) => selectedDivision === "all" || d.division_id === selectedDivision
  );

  // Metrics
  const activeDeals = filteredDeals.filter((d) => d.stage !== "lost" && d.stage !== "won");
  const wonDeals = filteredDeals.filter((d) => d.stage === "won");
  const lostDeals = filteredDeals.filter((d) => d.stage === "lost");

  const totalPipelineValue = activeDeals.reduce((sum, d) => sum + (d.value || 0), 0);
  const weightedForecast = activeDeals.reduce(
    (sum, d) => sum + ((d.value || 0) * (d.probability || 0)) / 100,
    0
  );
  const closedCount = wonDeals.length + lostDeals.length;
  const winRate = closedCount > 0 ? Math.round((wonDeals.length / closedCount) * 100) : 0;

  const getClientName = (clientId: string) => {
    const c = clients.find((client) => client.id === clientId);
    return c ? c.company_name : "Direct Account";
  };

  const getDivisionName = (divId: string) => {
    const d = divisions.find((div) => div.id === divId);
    return d ? d.short_name || d.name : "Division";
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    startTransition(async () => {
      const res = await createDeal({
        title: formData.title,
        client_id: formData.client_id,
        division_id: formData.division_id,
        value: parseFloat(formData.value) || 0,
        stage: formData.stage,
        expected_close_date: formData.expected_close_date || undefined,
        probability: parseInt(formData.probability) || 20,
      });

      if (res.error) {
        setCreateError(res.error);
      } else if (res.deal) {
        setDeals((prev) => [res.deal!, ...prev]);
        setIsCreateOpen(false);
        setFormData({
          title: "",
          client_id: clients[0]?.id || "",
          division_id: divisions[0]?.id || "",
          value: "10000",
          stage: "discovery",
          expected_close_date: "",
          probability: "20",
        });
      }
    });
  };

  const handleStageChange = (dealId: string, newStage: DealStage) => {
    startTransition(async () => {
      const res = await updateDealStage(dealId, newStage);
      if (res.success) {
        const probMap: Record<DealStage, number> = {
          discovery: 20,
          demo: 40,
          proposal: 60,
          negotiation: 80,
          won: 100,
          lost: 0,
        };
        setDeals((prev) =>
          prev.map((d) =>
            d.id === dealId ? { ...d, stage: newStage, probability: probMap[newStage] } : d
          )
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this deal opportunity?")) return;
    startTransition(async () => {
      const res = await deleteDeal(id);
      if (res.success) {
        setDeals((prev) => prev.filter((d) => d.id !== id));
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Sales Pipeline"
        description="Visual Kanban deal progression, revenue forecasting, and close rates across divisions."
        breadcrumbs={[{ label: "Business" }, { label: "Sales Pipeline", current: true }]}
        badge={<Badge variant="outline">Revenue Engine</Badge>}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Deal Opportunity
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Active Pipeline Value</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            ${totalPipelineValue.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">{activeDeals.length} active opportunities</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Weighted Forecast</span>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">
            ${weightedForecast.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Probability-adjusted revenue</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Win Rate</span>
            <Percent className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{winRate}%</div>
          <p className="text-xs text-zinc-500 mt-1">
            {wonDeals.length} won vs {lostDeals.length} lost
          </p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Won Revenue</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ${wonDeals.reduce((sum, d) => sum + (d.value || 0), 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Successfully closed contracts</p>
        </div>
      </div>

      {/* Division Selector */}
      <div className="flex items-center justify-between gap-4">
        <div className="w-72">
          <Select
            value={selectedDivision}
            onChange={(e) => setSelectedDivision(e.target.value)}
            className="bg-zinc-900/50 border-zinc-800 text-sm"
          >
            <option value="all">All Divisions (7)</option>
            {divisions.map((div) => (
              <option key={div.id} value={div.id}>
                {div.short_name || div.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="text-xs text-zinc-500">
          Drag or use stage controls to advance deals through the funnel
        </div>
      </div>

      {/* KANBAN BOARD */}
      {deals.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No Deals in Pipeline"
          description="Create your first sales deal or convert an inbound lead to populate the revenue pipeline."
          action={{
            label: "Create First Deal",
            onClick: () => setIsCreateOpen(true),
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
          {STAGES.map((stage) => {
            const stageDeals = filteredDeals.filter((d) => d.stage === stage.id);
            const stageTotal = stageDeals.reduce((sum, d) => sum + (d.value || 0), 0);

            return (
              <div
                key={stage.id}
                className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 flex flex-col min-h-[500px]"
              >
                {/* Column Header */}
                <div className="p-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 rounded-t-xl">
                  <div>
                    <div className="text-xs font-semibold text-zinc-200">{stage.label}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">
                      ${stageTotal.toLocaleString("en-US", { minimumFractionDigits: 0 })}
                    </div>
                  </div>
                  <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-400">
                    {stageDeals.length}
                  </span>
                </div>

                {/* Column Cards */}
                <div className="p-2 space-y-2 flex-1 overflow-y-auto">
                  {stageDeals.length === 0 ? (
                    <div className="text-center py-8 text-xs text-zinc-600 italic">No deals</div>
                  ) : (
                    stageDeals.map((deal) => (
                      <div
                        key={deal.id}
                        className="p-3 rounded-lg border border-zinc-800/90 bg-zinc-950/70 hover:border-zinc-700 transition-all space-y-2.5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-1">
                          <h4 className="text-xs font-semibold text-zinc-100 line-clamp-2">
                            {deal.title}
                          </h4>
                          <button
                            onClick={() => handleDelete(deal.id)}
                            className="text-zinc-600 hover:text-red-400 p-0.5"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>

                        <div className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                          <Building2 className="h-3 w-3 text-zinc-500 shrink-0" />
                          <span className="truncate">{getClientName(deal.client_id)}</span>
                        </div>

                        <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-800/50">
                          <span className="font-bold text-zinc-100">
                            ${(deal.value || 0).toLocaleString()}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                            {deal.probability}% win
                          </span>
                        </div>

                        <div className="flex items-center justify-between gap-1 pt-1">
                          <span className="text-[10px] text-zinc-500 truncate">
                            {getDivisionName(deal.division_id)}
                          </span>

                          {/* Quick Stage Mover */}
                          <select
                            value={deal.stage}
                            disabled={isPending}
                            onChange={(e) => handleStageChange(deal.id, e.target.value as DealStage)}
                            className="text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-1 py-0.5"
                          >
                            {STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE DEAL MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Sales Deal Opportunity"
        description="Track a prospective deal in the revenue pipeline."
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Deal Title *</label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enterprise Platform Modernization Retainer"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Client Account *</label>
              {clients.length > 0 ? (
                <Select
                  value={formData.client_id}
                  onChange={(e) => setFormData({ ...formData, client_id: e.target.value })}
                  required
                >
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.company_name}
                    </option>
                  ))}
                </Select>
              ) : (
                <div className="text-xs text-amber-400 p-2 border border-amber-500/20 rounded-md bg-amber-500/10">
                  No clients available. Please create a client account first in Clients module.
                </div>
              )}
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Division *</label>
              <Select
                value={formData.division_id}
                onChange={(e) => setFormData({ ...formData, division_id: e.target.value })}
                required
              >
                {divisions.map((div) => (
                  <option key={div.id} value={div.id}>
                    {div.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Deal Value ($) *</label>
              <Input
                type="number"
                min="0"
                required
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Initial Stage</label>
              <Select
                value={formData.stage}
                onChange={(e) => setFormData({ ...formData, stage: e.target.value as DealStage })}
              >
                {STAGES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Expected Close Date</label>
              <Input
                type="date"
                value={formData.expected_close_date}
                onChange={(e) => setFormData({ ...formData, expected_close_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || clients.length === 0}>
              {isPending ? "Creating..." : "Create Deal"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

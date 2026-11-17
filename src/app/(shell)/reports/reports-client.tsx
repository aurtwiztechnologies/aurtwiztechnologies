"use client";

import React, { useState } from "react";
import { PageHeader } from "@/components/common/page-header";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  DollarSign,
  TrendingUp,
  Receipt,
  Building2,
  Calendar,
  Layers,
  Activity,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { DIVISIONS } from "@/config/divisions";
import type { InvoiceRow, PaymentRow, ExpenseRow } from "@/lib/actions/finance";
import type { DealRow } from "@/lib/actions/deals";
import type { ProjectRow } from "@/lib/actions/projects";
import type { ActivityLogRow } from "@/lib/actions/activity";
import type { DivisionRow } from "@/lib/actions/divisions";
import Link from "next/link";

interface ReportsClientProps {
  invoices: InvoiceRow[];
  payments: PaymentRow[];
  expenses: ExpenseRow[];
  deals: DealRow[];
  projects: ProjectRow[];
  activityLogs: ActivityLogRow[];
  divisions: DivisionRow[];
}

export function ReportsClient({
  invoices,
  payments,
  expenses,
  deals,
  projects,
  activityLogs,
  divisions,
}: ReportsClientProps) {
  const [activeTab, setActiveTab] = useState<"financial" | "divisions" | "audit">("financial");

  // Calculations
  const grossSettledRevenue = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalInvoiced = invoices.reduce((sum, i) => sum + (i.total_amount || 0), 0);
  const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const netMargin = grossSettledRevenue - totalExpenses;
  const netMarginPercent =
    grossSettledRevenue > 0 ? Math.round((netMargin / grossSettledRevenue) * 100) : 0;
  const pipelineValue = deals
    .filter((d) => d.stage !== "lost" && d.stage !== "won")
    .reduce((sum, d) => sum + (d.value || 0), 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Business Reports & Intelligence"
        description="Cross-division revenue attribution, project velocity, pipeline conversion, and profit margins."
        breadcrumbs={[{ label: "Analytics" }, { label: "Reports", current: true }]}
        badge={<Badge variant="outline">Intelligence</Badge>}
        actions={
          <div className="flex items-center gap-2">
            <Link href="/finance/invoices">
              <Button variant="outline" size="sm" className="text-xs">
                Invoices Ledger
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Settled Gross Revenue</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ${grossSettledRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Cleared customer payments</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Operating Expenses</span>
            <Receipt className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">
            ${totalExpenses.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Total divisional expenditures</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Net Operating Profit</span>
            <TrendingUp className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            ${netMargin.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Margin: {netMarginPercent}%</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Open Sales Pipeline</span>
            <Layers className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            ${pipelineValue.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Prospect opportunities in progress</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 gap-6">
        <button
          onClick={() => setActiveTab("financial")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "financial"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Financial Cashflow Summary
        </button>
        <button
          onClick={() => setActiveTab("divisions")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "divisions"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          Division Matrix
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "audit"
              ? "border-blue-500 text-blue-400"
              : "border-transparent text-zinc-400 hover:text-zinc-200"
          }`}
        >
          System Audit Trail ({activityLogs.length})
        </button>
      </div>

      {/* Tab 1: Financial Overview */}
      {activeTab === "financial" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invoiced vs. Received Settlements</CardTitle>
              <CardDescription className="text-xs">
                Comparison of billed invoice amounts against actual incoming settlements.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Total Invoiced</span>
                  <div className="text-xl font-bold text-zinc-100 mt-1">
                    ${totalInvoiced.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-xs text-zinc-400">{invoices.length} invoices generated</span>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Settled In Full</span>
                  <div className="text-xl font-bold text-emerald-400 mt-1">
                    ${grossSettledRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-xs text-zinc-400">
                    {invoices.filter((i) => i.status === "paid").length} invoices paid
                  </span>
                </div>

                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950/50">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">Uncollected Outstanding</span>
                  <div className="text-xl font-bold text-amber-400 mt-1">
                    ${(totalInvoiced - grossSettledRevenue > 0 ? totalInvoiced - grossSettledRevenue : 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </div>
                  <span className="text-xs text-zinc-400">Awaiting clearance</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Tab 2: Division Performance Matrix */}
      {activeTab === "divisions" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">7-Division Performance Matrix</CardTitle>
            <CardDescription className="text-xs">
              Operational breakdown across all 7 business divisions of Aurtwiz Technologies.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Division</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Standard Services</TableHead>
                  <TableHead>Executive Lead</TableHead>
                  <TableHead className="text-right">Workspace</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {DIVISIONS.map((div) => (
                  <TableRow key={div.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span
                          className="h-2.5 w-2.5 rounded-full"
                          style={{ backgroundColor: div.color }}
                        />
                        <span className="font-semibold text-zinc-100">{div.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                        {div.code}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-zinc-300">{div.services.length} offerings</span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs text-zinc-400">{div.leadRole}</span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Link
                        href={`/divisions/${div.slug}`}
                        className="text-xs text-blue-400 hover:text-blue-300 inline-flex items-center gap-1 font-medium"
                      >
                        Hub
                        <ArrowUpRight className="h-3 w-3" />
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Tab 3: System Audit Trail */}
      {activeTab === "audit" && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <CardTitle className="text-base">Immutable Audit Activity Trail</CardTitle>
            </div>
            <CardDescription className="text-xs">
              System event logs recorded in <code className="text-zinc-300">public.activity_logs</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {activityLogs.length === 0 ? (
              <div className="text-center py-10 text-xs text-zinc-500 italic">
                No activity records logged yet. Actions like creating leads, issuing invoices, or modifying roles will appear here.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Action Logged</TableHead>
                    <TableHead>Entity Scope</TableHead>
                    <TableHead className="text-right">Entity ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        <div className="text-xs font-mono text-zinc-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-zinc-500" />
                          {new Date(log.created_at).toLocaleString()}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-medium text-zinc-200 text-xs">{log.action}</span>
                      </TableCell>
                      <TableCell>
                        <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase">
                          {log.entity_type}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="text-xs font-mono text-zinc-500">
                          {log.entity_id ? `${log.entity_id.slice(0, 8)}...` : "—"}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

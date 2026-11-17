"use client";

import React, { useState, useTransition } from "react";
import { PageHeader } from "@/components/common/page-header";
import { EmptyState } from "@/components/common/empty-state";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
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
  FileText,
  Plus,
  Search,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Calendar,
  Building2,
  Clock,
  ArrowUpRight,
} from "lucide-react";
import {
  createInvoice,
  updateInvoiceStatus,
  type InvoiceRow,
} from "@/lib/actions/finance";
import type { ClientRow } from "@/lib/actions/clients";
import type { DivisionRow } from "@/lib/actions/divisions";
import type { ProjectRow } from "@/lib/actions/projects";
import type { InvoiceStatus } from "@/types/database";
import Link from "next/link";

interface InvoicesClientProps {
  initialInvoices: InvoiceRow[];
  clients: ClientRow[];
  divisions: DivisionRow[];
  projects: ProjectRow[];
}

export function InvoicesClient({
  initialInvoices,
  clients,
  divisions,
  projects,
}: InvoicesClientProps) {
  const [invoices, setInvoices] = useState<InvoiceRow[]>(initialInvoices);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    invoice_number: `AW-INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    client_id: clients[0]?.id || "",
    division_id: divisions[0]?.id || "",
    project_id: "",
    subtotal: "5000",
    tax: "0",
    issue_date: new Date().toISOString().split("T")[0],
    due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
    notes: "",
  });

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      searchTerm === "" ||
      inv.invoice_number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision =
      selectedDivision === "all" || inv.division_id === selectedDivision;
    const matchesStatus =
      selectedStatus === "all" || inv.status === selectedStatus;

    return matchesSearch && matchesDivision && matchesStatus;
  });

  // Metrics
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const paidInvoices = invoices.filter((i) => i.status === "paid");
  const paidAmount = paidInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const outstandingInvoices = invoices.filter((i) => i.status === "issued" || i.status === "overdue");
  const outstandingAmount = outstandingInvoices.reduce((sum, inv) => sum + (inv.total_amount || 0), 0);
  const overdueCount = invoices.filter((i) => i.status === "overdue").length;

  const getClientName = (clientId: string) => {
    const c = clients.find((client) => client.id === clientId);
    return c ? c.company_name : "Direct Account";
  };

  const getDivisionName = (divId: string) => {
    const d = divisions.find((div) => div.id === divId);
    return d ? d.short_name || d.name : "Division";
  };

  const getStatusBadge = (status: InvoiceStatus) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline" className="border-zinc-700 text-zinc-400 bg-zinc-800/40">Draft</Badge>;
      case "issued":
        return <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10">Issued</Badge>;
      case "paid":
        return <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10">Paid</Badge>;
      case "overdue":
        return <Badge variant="outline" className="border-red-500/40 text-red-400 bg-red-500/10">Overdue</Badge>;
      case "cancelled":
        return <Badge variant="outline" className="border-zinc-700 text-zinc-500">Cancelled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    startTransition(async () => {
      const res = await createInvoice({
        invoice_number: formData.invoice_number,
        client_id: formData.client_id,
        division_id: formData.division_id,
        project_id: formData.project_id || undefined,
        subtotal: parseFloat(formData.subtotal) || 0,
        tax: parseFloat(formData.tax) || 0,
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        notes: formData.notes || undefined,
      });

      if (res.error) {
        setCreateError(res.error);
      } else if (res.invoice) {
        setInvoices((prev) => [res.invoice!, ...prev]);
        setIsCreateOpen(false);
        setFormData({
          invoice_number: `AW-INV-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          client_id: clients[0]?.id || "",
          division_id: divisions[0]?.id || "",
          project_id: "",
          subtotal: "5000",
          tax: "0",
          issue_date: new Date().toISOString().split("T")[0],
          due_date: new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0],
          notes: "",
        });
      }
    });
  };

  const handleStatusChange = (invoiceId: string, newStatus: InvoiceStatus) => {
    startTransition(async () => {
      const res = await updateInvoiceStatus(invoiceId, newStatus);
      if (res.success) {
        setInvoices((prev) =>
          prev.map((i) => (i.id === invoiceId ? { ...i, status: newStatus } : i))
        );
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Client Invoices"
        description="Client billing, milestone invoicing, recurring contracts, and payment tracking."
        breadcrumbs={[{ label: "Finance" }, { label: "Invoices", current: true }]}
        badge={<Badge variant="outline">Billing</Badge>}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Issue New Invoice
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Total Invoiced</span>
            <FileText className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            ${totalInvoiced.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">{invoices.length} invoices generated</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Settled / Paid</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ${paidAmount.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">{paidInvoices.length} settled in full</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Outstanding Balance</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            ${outstandingAmount.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">{outstandingInvoices.length} awaiting settlement</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Overdue Invoices</span>
            <AlertCircle className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-red-400">{overdueCount}</div>
          <p className="text-xs text-zinc-500 mt-1">Requiring collection notice</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by invoice number..."
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

        <div className="w-full sm:w-44">
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-zinc-900/50 border-zinc-800 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="draft">Draft</option>
            <option value="issued">Issued</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
            <option value="cancelled">Cancelled</option>
          </Select>
        </div>
      </div>

      {/* Invoices Table */}
      {filteredInvoices.length === 0 ? (
        <EmptyState
          icon={FileText}
          title={invoices.length === 0 ? "No Invoices Issued Yet" : "No Matching Invoices Found"}
          description={
            invoices.length === 0
              ? "Issue your first billing invoice for completed client milestones or project retainers."
              : "Try adjusting your search criteria or status filter."
          }
          action={
            invoices.length === 0
              ? {
                  label: "Issue First Invoice",
                  onClick: () => setIsCreateOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice #</TableHead>
                <TableHead>Client Account</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell>
                    <div className="font-mono text-xs font-semibold text-blue-400">
                      {inv.invoice_number}
                    </div>
                    <div className="text-[11px] text-zinc-500 mt-0.5">
                      Issued {inv.issue_date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-zinc-200">
                      <Building2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span>{getClientName(inv.client_id)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium px-2 py-0.5 rounded border border-zinc-800 bg-zinc-800/40 text-zinc-300">
                      {getDivisionName(inv.division_id)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-zinc-100">
                      ${(inv.total_amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    {inv.tax && inv.tax > 0 ? (
                      <div className="text-[10px] text-zinc-500">incl. ${inv.tax} tax</div>
                    ) : null}
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-zinc-300 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-zinc-500" />
                      {inv.due_date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <select
                      value={inv.status}
                      disabled={isPending}
                      onChange={(e) => handleStatusChange(inv.id, e.target.value as InvoiceStatus)}
                      className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2 py-1"
                    >
                      <option value="draft">Draft</option>
                      <option value="issued">Issued</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Link
                      href="/finance/payments"
                      className="text-xs px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors inline-flex items-center gap-1"
                    >
                      Payments
                      <ArrowUpRight className="h-3 w-3" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* ISSUE INVOICE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Issue Client Billing Invoice"
        description="Generate an invoice record for deliverables and milestones."
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Invoice Number *</label>
              <Input
                required
                value={formData.invoice_number}
                onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Executing Division *</label>
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
              <label className="block text-xs font-medium text-zinc-400 mb-1">Associated Project</label>
              <Select
                value={formData.project_id}
                onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
              >
                <option value="">Direct Retainer (No Project)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} — {p.title}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Subtotal ($) *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.subtotal}
                onChange={(e) => setFormData({ ...formData, subtotal: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Tax / GST ($)</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.tax}
                onChange={(e) => setFormData({ ...formData, tax: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Issue Date</label>
              <Input
                type="date"
                required
                value={formData.issue_date}
                onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Payment Due</label>
              <Input
                type="date"
                required
                value={formData.due_date}
                onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Invoice Notes / Bank Wire Details</label>
            <Textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Wire instructions, milestone breakdown, terms..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || clients.length === 0}>
              {isPending ? "Issuing..." : "Issue Invoice"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

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
  CreditCard,
  Plus,
  Search,
  DollarSign,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  Calendar,
} from "lucide-react";
import {
  recordPayment,
  type PaymentRow,
  type InvoiceRow,
} from "@/lib/actions/finance";
import type { PaymentStatus } from "@/types/database";

interface PaymentsClientProps {
  initialPayments: PaymentRow[];
  invoices: InvoiceRow[];
}

export function PaymentsClient({ initialPayments, invoices }: PaymentsClientProps) {
  const [payments, setPayments] = useState<PaymentRow[]>(initialPayments);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Record Payment Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    invoice_id: invoices[0]?.id || "",
    amount: invoices[0]?.total_amount ? String(invoices[0].total_amount) : "5000",
    payment_method: "Wire Transfer",
    transaction_reference: `TXN-${Date.now().toString().slice(-6)}`,
    notes: "",
  });

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      searchTerm === "" ||
      (p.transaction_reference &&
        p.transaction_reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.payment_method.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      selectedStatus === "all" || p.status === selectedStatus;

    return matchesSearch && matchesStatus;
  });

  // Metrics
  const totalSettled = payments
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.amount || 0), 0);
  const pendingCount = payments.filter((p) => p.status === "pending").length;

  const getInvoiceNumber = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    return inv ? inv.invoice_number : "Invoice";
  };

  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10">Completed</Badge>;
      case "pending":
        return <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10">Pending</Badge>;
      case "failed":
        return <Badge variant="outline" className="border-red-500/40 text-red-400 bg-red-500/10">Failed</Badge>;
      case "refunded":
        return <Badge variant="outline" className="border-purple-500/40 text-purple-400">Refunded</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    startTransition(async () => {
      const selectedInvoice = invoices.find((i) => i.id === formData.invoice_id);
      const res = await recordPayment({
        invoice_id: formData.invoice_id || undefined,
        client_id: selectedInvoice?.client_id || "",
        amount: parseFloat(formData.amount) || 0,
        payment_method: formData.payment_method,
        transaction_reference: formData.transaction_reference || `TXN-${Date.now().toString().slice(-6)}`,
      });

      if (res.error) {
        setCreateError(res.error);
      } else if (res.payment) {
        setPayments((prev) => [res.payment!, ...prev]);
        setIsCreateOpen(false);
        setFormData({
          invoice_id: invoices[0]?.id || "",
          amount: "5000",
          payment_method: "Wire Transfer",
          transaction_reference: `TXN-${Date.now().toString().slice(-6)}`,
          notes: "",
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payments Ledger"
        description="Inbound client settlements, transaction logs, and payment reconciliation across divisions."
        breadcrumbs={[{ label: "Finance" }, { label: "Payments", current: true }]}
        badge={<Badge variant="outline">Treasury</Badge>}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Record Payment Receipt
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Total Received Funds</span>
            <DollarSign className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">
            ${totalSettled.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Confirmed settled revenue</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Cleared Transactions</span>
            <CheckCircle2 className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            {payments.filter((p) => p.status === "completed").length}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Processed payment receipts</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Pending Clearances</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{pendingCount}</div>
          <p className="text-xs text-zinc-500 mt-1">Awaiting bank verification</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by transaction reference or method..."
            className="pl-9 bg-zinc-900/50 border-zinc-800 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-48">
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-zinc-900/50 border-zinc-800 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="completed">Completed</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </Select>
        </div>
      </div>

      {/* Payments Table */}
      {filteredPayments.length === 0 ? (
        <EmptyState
          icon={CreditCard}
          title={payments.length === 0 ? "No Payments Recorded Yet" : "No Matching Payments Found"}
          description={
            payments.length === 0
              ? "Reconcile an inbound payment against an issued client invoice."
              : "Try adjusting your search criteria."
          }
          action={
            payments.length === 0
              ? {
                  label: "Record First Payment",
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
                <TableHead>Reference / Txn ID</TableHead>
                <TableHead>Reconciled Invoice</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Settlement Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Settled Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="font-mono text-xs font-semibold text-zinc-100">
                      {p.transaction_reference || "TXN-DIRECT"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-blue-400 font-medium">
                      <FileText className="h-3 w-3 text-zinc-500" />
                      {getInvoiceNumber(p.invoice_id || "")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-zinc-300 font-medium">{p.payment_method}</span>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-emerald-400">
                      ${(p.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(p.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="text-xs text-zinc-400 flex items-center justify-end gap-1">
                      <Calendar className="h-3 w-3 text-zinc-500" />
                      {p.received_at ? new Date(p.received_at).toLocaleDateString() : "—"}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* RECORD PAYMENT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Record Client Payment Receipt"
        description="Reconcile an incoming payment against an existing invoice."
        size="md"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Reconcile Invoice *</label>
            {invoices.length > 0 ? (
              <Select
                value={formData.invoice_id}
                onChange={(e) => {
                  const inv = invoices.find((i) => i.id === e.target.value);
                  setFormData({
                    ...formData,
                    invoice_id: e.target.value,
                    amount: inv ? String(inv.total_amount) : formData.amount,
                  });
                }}
                required
              >
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.invoice_number} — ${inv.total_amount} ({inv.status})
                  </option>
                ))}
              </Select>
            ) : (
              <div className="text-xs text-amber-400 p-2 border border-amber-500/20 rounded-md bg-amber-500/10">
                No invoices found. Please issue an invoice first in the Invoices tab.
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Amount Received ($) *</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                required
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Payment Method *</label>
              <Select
                value={formData.payment_method}
                onChange={(e) => setFormData({ ...formData, payment_method: e.target.value })}
              >
                <option value="Wire Transfer">Wire Transfer / ACH</option>
                <option value="Credit Card">Credit Card (Stripe)</option>
                <option value="FiveM Marketplace">FiveM Store Checkout</option>
                <option value="PayPal">PayPal</option>
                <option value="Crypto">USDT / USDC</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Transaction Reference</label>
            <Input
              value={formData.transaction_reference}
              onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
              placeholder="e.g. TXN-893019 or Bank Wire Ref"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Payment Notes</label>
            <Textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Settlement notes, sender reference..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || invoices.length === 0}>
              {isPending ? "Recording..." : "Confirm Receipt"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

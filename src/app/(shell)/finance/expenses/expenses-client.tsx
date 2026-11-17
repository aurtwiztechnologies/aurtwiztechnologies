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
  Receipt,
  Plus,
  Search,
  DollarSign,
  Calendar,
  Building2,
  TrendingDown,
  Layers,
} from "lucide-react";
import {
  createExpense,
  type ExpenseRow,
} from "@/lib/actions/finance";
import type { DivisionRow } from "@/lib/actions/divisions";
import type { ExpenseCategory } from "@/types/database";

interface ExpensesClientProps {
  initialExpenses: ExpenseRow[];
  divisions: DivisionRow[];
}

const CATEGORIES: { id: ExpenseCategory; label: string }[] = [
  { id: "software_licenses", label: "Software & SaaS Subscriptions" },
  { id: "contractors", label: "Contractors & Freelance Talent" },
  { id: "marketing", label: "Advertising & Marketing" },
  { id: "hardware", label: "Hardware & Infrastructure" },
  { id: "office", label: "Office & Facilities" },
  { id: "travel", label: "Travel & Hospitality" },
  { id: "miscellaneous", label: "Miscellaneous Operations" },
];

export function ExpensesClient({ initialExpenses, divisions }: ExpensesClientProps) {
  const [expenses, setExpenses] = useState<ExpenseRow[]>(initialExpenses);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    description: "",
    amount: "150",
    division_id: divisions[0]?.id || "",
    category: "software_licenses" as ExpenseCategory,
    vendor: "",
    incurred_date: new Date().toISOString().split("T")[0],
  });

  const filteredExpenses = expenses.filter((e) => {
    const matchesSearch =
      searchTerm === "" ||
      e.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (e.vendor && e.vendor.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDivision =
      selectedDivision === "all" || e.division_id === selectedDivision;
    const matchesCategory =
      selectedCategory === "all" || e.category === selectedCategory;

    return matchesSearch && matchesDivision && matchesCategory;
  });

  // Metrics
  const totalBurn = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
  const softwareBurn = expenses
    .filter((e) => e.category === "software_licenses")
    .reduce((sum, e) => sum + (e.amount || 0), 0);
  const contractorBurn = expenses
    .filter((e) => e.category === "contractors")
    .reduce((sum, e) => sum + (e.amount || 0), 0);

  const getDivisionName = (divId: string) => {
    const d = divisions.find((div) => div.id === divId);
    return d ? d.short_name || d.name : "Company Wide";
  };

  const getCategoryBadge = (category: ExpenseCategory) => {
    switch (category) {
      case "software_licenses":
        return <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10">Software</Badge>;
      case "contractors":
        return <Badge variant="outline" className="border-purple-500/40 text-purple-400 bg-purple-500/10">Contractors</Badge>;
      case "marketing":
        return <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10">Marketing</Badge>;
      case "hardware":
        return <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10">Hardware</Badge>;
      default:
        return <Badge variant="outline" className="border-zinc-700 text-zinc-400">{category}</Badge>;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    startTransition(async () => {
      const res = await createExpense({
        description: formData.description,
        amount: parseFloat(formData.amount) || 0,
        division_id: formData.division_id || undefined,
        category: formData.category,
        vendor: formData.vendor || "Direct",
        incurred_date: formData.incurred_date,
      });

      if (res.error) {
        setCreateError(res.error);
      } else if (res.expense) {
        setExpenses((prev) => [res.expense!, ...prev]);
        setIsCreateOpen(false);
        setFormData({
          description: "",
          amount: "150",
          division_id: divisions[0]?.id || "",
          category: "software_licenses",
          vendor: "",
          incurred_date: new Date().toISOString().split("T")[0],
        });
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Expenses Management"
        description="Operating costs, software subscriptions, contractor payouts, and division budgets."
        breadcrumbs={[{ label: "Finance" }, { label: "Expenses", current: true }]}
        badge={<Badge variant="outline">Expenditure</Badge>}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Submit Expense
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Total Operating Spend</span>
            <TrendingDown className="h-4 w-4 text-red-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            ${totalBurn.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">{expenses.length} claims filed</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">SaaS & Software</span>
            <Layers className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">
            ${softwareBurn.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Tools and cloud infrastructure</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Contractor Payouts</span>
            <DollarSign className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">
            ${contractorBurn.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Freelance talent delivery costs</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Divisions Incurred</span>
            <Building2 className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            {new Set(expenses.map((e) => e.division_id).filter(Boolean)).size} / 7
          </div>
          <p className="text-xs text-zinc-500 mt-1">Divisional cost centers</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by expense description or vendor..."
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

        <div className="w-full sm:w-56">
          <Select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-zinc-900/50 border-zinc-800 text-sm"
          >
            <option value="all">All Categories</option>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {/* Expenses Table */}
      {filteredExpenses.length === 0 ? (
        <EmptyState
          icon={Receipt}
          title={expenses.length === 0 ? "No Expenses Logged Yet" : "No Matching Expenses Found"}
          description={
            expenses.length === 0
              ? "Track operational software subscriptions, hardware purchases, or contractor costs."
              : "Try adjusting your search criteria or category filter."
          }
          action={
            expenses.length === 0
              ? {
                  label: "Submit First Expense",
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
                <TableHead>Expense Description</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Incurred Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExpenses.map((exp) => (
                <TableRow key={exp.id}>
                  <TableCell>
                    <div className="font-semibold text-zinc-100">{exp.description}</div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-zinc-300 font-medium">{exp.vendor || "Direct"}</span>
                  </TableCell>
                  <TableCell>{getCategoryBadge(exp.category)}</TableCell>
                  <TableCell>
                    <span className="text-xs font-medium px-2 py-0.5 rounded border border-zinc-800 bg-zinc-800/40 text-zinc-300">
                      {getDivisionName(exp.division_id || "")}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-bold text-red-400">
                      -${(exp.amount || 0).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-xs text-zinc-400 flex items-center justify-end gap-1">
                      <Calendar className="h-3 w-3 text-zinc-500" />
                      {exp.incurred_date}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* SUBMIT EXPENSE MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Submit Operational Expense Claim"
        description="Record business cost against a division budget."
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Expense Description / Purpose *</label>
            <Input
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="e.g. AWS Cloud Infrastructure or Figma Enterprise Subscription"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Cost Center Division *</label>
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
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Expense Category *</label>
              <Select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ExpenseCategory })}
                required
              >
                {CATEGORIES.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Amount ($) *</label>
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
              <label className="block text-xs font-medium text-zinc-400 mb-1">Vendor / Payee</label>
              <Input
                value={formData.vendor}
                onChange={(e) => setFormData({ ...formData, vendor: e.target.value })}
                placeholder="Amazon Web Services"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Incurred Date</label>
              <Input
                type="date"
                required
                value={formData.incurred_date}
                onChange={(e) => setFormData({ ...formData, incurred_date: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Submitting..." : "Submit Expense"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

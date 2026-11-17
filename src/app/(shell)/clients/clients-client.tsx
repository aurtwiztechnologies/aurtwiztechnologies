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
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Building2,
  Plus,
  Search,
  Mail,
  Phone,
  Globe,
  DollarSign,
  Briefcase,
  Trash2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from "lucide-react";
import {
  createClient,
  updateClient,
  deleteClient,
  type ClientRow,
} from "@/lib/actions/clients";
import type { DivisionRow } from "@/lib/actions/divisions";
import Link from "next/link";

interface ClientsClientProps {
  initialClients: ClientRow[];
  divisions: DivisionRow[];
}

export function ClientsClient({ initialClients, divisions }: ClientsClientProps) {
  const [clients, setClients] = useState<ClientRow[]>(initialClients);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    website: "",
    industry: "General Enterprise",
    primary_division_id: divisions[0]?.id || "",
  });

  // Filter clients
  const filteredClients = clients.filter((c) => {
    const matchesSearch =
      searchTerm === "" ||
      c.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.contact_person.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.industry && c.industry.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesDivision =
      selectedDivision === "all" || c.primary_division_id === selectedDivision;

    const matchesStatus =
      selectedStatus === "all" || c.status === selectedStatus;

    return matchesSearch && matchesDivision && matchesStatus;
  });

  // Stats calculation
  const totalClients = clients.length;
  const activeClients = clients.filter((c) => c.status === "active").length;
  const totalLifetimeValue = clients.reduce(
    (sum, c) => sum + (c.total_revenue || 0),
    0
  );

  const getDivisionName = (divId: string | null) => {
    if (!divId) return "Unassigned";
    const div = divisions.find((d) => d.id === divId);
    return div ? div.short_name || div.name : "Division";
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    startTransition(async () => {
      const res = await createClient({
        company_name: formData.company_name,
        contact_person: formData.contact_person,
        email: formData.email,
        phone: formData.phone || undefined,
        website: formData.website || undefined,
        industry: formData.industry || "General Enterprise",
        primary_division_id: formData.primary_division_id,
      });

      if (res.error) {
        setCreateError(res.error);
      } else if (res.client) {
        setClients((prev) => [res.client!, ...prev]);
        setIsCreateOpen(false);
        setFormData({
          company_name: "",
          contact_person: "",
          email: "",
          phone: "",
          website: "",
          industry: "General Enterprise",
          primary_division_id: divisions[0]?.id || "",
        });
      }
    });
  };

  const handleStatusChange = (clientId: string, newStatus: "active" | "inactive" | "lead") => {
    startTransition(async () => {
      const res = await updateClient(clientId, { status: newStatus });
      if (res.success) {
        setClients((prev) =>
          prev.map((c) => (c.id === clientId ? { ...c, status: newStatus } : c))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this client record?")) return;
    startTransition(async () => {
      const res = await deleteClient(id);
      if (res.success) {
        setClients((prev) => prev.filter((c) => c.id !== id));
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Clients Directory"
        description="Corporate accounts, ongoing retainers, and client relationships across all business divisions."
        breadcrumbs={[{ label: "Business" }, { label: "Clients", current: true }]}
        badge={<Badge variant="outline">CRM Core</Badge>}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Client Account
          </Button>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Corporate Accounts</span>
            <Building2 className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">{totalClients}</div>
          <p className="text-xs text-zinc-500 mt-1">Total onboarded accounts</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Active Retainers</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{activeClients}</div>
          <p className="text-xs text-zinc-500 mt-1">In active business relations</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Divisions Engaged</span>
            <Briefcase className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">
            {new Set(clients.map((c) => c.primary_division_id).filter(Boolean)).size} / 7
          </div>
          <p className="text-xs text-zinc-500 mt-1">Cross-division deployment</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Total Lifetime Value</span>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            ${totalLifetimeValue.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Cumulative billed revenue</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by company, contact person, email, or industry..."
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
            <option value="all">All Divisions (7)</option>
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
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="lead">Lead Prospect</option>
          </Select>
        </div>
      </div>

      {/* Clients Table */}
      {filteredClients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title={clients.length === 0 ? "No Corporate Clients Yet" : "No Matching Clients Found"}
          description={
            clients.length === 0
              ? "Onboard your first corporate account or convert a qualified lead from the Leads module."
              : "Try adjusting your search criteria or division filters."
          }
          action={
            clients.length === 0
              ? {
                  label: "Add First Client",
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
                <TableHead>Company & Industry</TableHead>
                <TableHead>Key Contact Person</TableHead>
                <TableHead>Primary Division</TableHead>
                <TableHead>Lifetime Revenue</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell>
                    <div className="font-semibold text-zinc-100 flex items-center gap-1.5">
                      {client.company_name}
                      {client.website && (
                        <a
                          href={client.website.startsWith("http") ? client.website : `https://${client.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-zinc-500 hover:text-zinc-300"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                    <div className="text-xs text-zinc-400 mt-0.5">{client.industry || "Enterprise"}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-zinc-200">{client.contact_person}</div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {client.email}
                      </span>
                      {client.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {client.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium px-2 py-0.5 rounded border border-zinc-800 bg-zinc-800/40 text-zinc-300">
                      {getDivisionName(client.primary_division_id)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-zinc-200">
                      ${(client.total_revenue || 0).toLocaleString("en-US", { minimumFractionDigits: 0 })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <select
                      value={client.status}
                      disabled={isPending}
                      onChange={(e) => handleStatusChange(client.id, e.target.value as "active" | "inactive" | "lead")}
                      className={`text-xs font-medium rounded px-2 py-1 border transition-colors ${
                        client.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                          : client.status === "lead"
                          ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                          : "bg-zinc-800/40 text-zinc-400 border-zinc-700"
                      }`}
                    >
                      <option value="active" className="bg-zinc-900 text-zinc-100">Active Retainer</option>
                      <option value="lead" className="bg-zinc-900 text-zinc-100">Prospect</option>
                      <option value="inactive" className="bg-zinc-900 text-zinc-100">Inactive</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/projects`}
                        className="text-xs px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
                      >
                        Projects
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(client.id)}
                        className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE CLIENT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add Corporate Client Account"
        description="Register an enterprise or client organization into Aurtwiz CRM."
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
              <label className="block text-xs font-medium text-zinc-400 mb-1">Company / Organization Name *</label>
              <Input
                required
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Apex Media Global"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Primary Division Relationship *</label>
              <Select
                value={formData.primary_division_id}
                onChange={(e) => setFormData({ ...formData, primary_division_id: e.target.value })}
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
              <label className="block text-xs font-medium text-zinc-400 mb-1">Primary Contact Person *</label>
              <Input
                required
                value={formData.contact_person}
                onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                placeholder="Sarah Connor"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Contact Email *</label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="sarah@apexmedia.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Phone Number</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Website URL</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://apexmedia.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Industry Sector</label>
              <Input
                value={formData.industry}
                onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                placeholder="Gaming / Entertainment"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Registering..." : "Register Client"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

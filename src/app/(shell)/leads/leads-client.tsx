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
  UserPlus,
  Search,
  Filter,
  ArrowRightCircle,
  Building2,
  Mail,
  Phone,
  DollarSign,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import {
  createLead,
  updateLeadStatus,
  convertLeadToClient,
  deleteLead,
  type LeadRow,
} from "@/lib/actions/leads";
import type { DivisionRow } from "@/lib/actions/divisions";
import type { ServiceRow } from "@/lib/actions/services";
import type { LeadStatus } from "@/types/database";

interface LeadsClientProps {
  initialLeads: LeadRow[];
  divisions: DivisionRow[];
  services: ServiceRow[];
}

export function LeadsClient({ initialLeads, divisions, services }: LeadsClientProps) {
  const [leads, setLeads] = useState<LeadRow[]>(initialLeads);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Modal States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [convertLead, setConvertLead] = useState<LeadRow | null>(null);
  const [convertError, setConvertError] = useState("");

  // Create Form State
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    company_name: "",
    division_id: divisions[0]?.id || "",
    service_interest_id: "",
    estimated_value: "",
    source: "Website",
    notes: "",
  });

  // Convert Form State
  const [convertData, setConvertData] = useState({
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    industry: "General Enterprise",
    dealValue: "5000",
  });

  // Filtered Leads
  const filteredLeads = leads.filter((lead) => {
    const matchesSearch =
      searchTerm === "" ||
      `${lead.first_name} ${lead.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.company_name && lead.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      lead.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDivision =
      selectedDivision === "all" || lead.division_id === selectedDivision;

    const matchesStatus =
      selectedStatus === "all" || lead.status === selectedStatus;

    return matchesSearch && matchesDivision && matchesStatus;
  });

  // Stats calculation
  const totalLeads = leads.length;
  const newLeads = leads.filter((l) => l.status === "new").length;
  const qualifiedLeads = leads.filter((l) => l.status === "qualified").length;
  const totalPipelineEst = leads
    .filter((l) => l.status !== "lost" && l.status !== "converted")
    .reduce((sum, l) => sum + (l.estimated_value || 0), 0);

  const getDivisionName = (divId: string) => {
    const div = divisions.find((d) => d.id === divId);
    return div ? div.short_name || div.name : "Division";
  };

  const getStatusBadge = (status: LeadStatus) => {
    switch (status) {
      case "new":
        return <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10">New</Badge>;
      case "contacted":
        return <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10">Contacted</Badge>;
      case "qualified":
        return <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10">Qualified</Badge>;
      case "proposal_sent":
        return <Badge variant="outline" className="border-purple-500/40 text-purple-400 bg-purple-500/10">Proposal Sent</Badge>;
      case "converted":
        return <Badge variant="outline" className="border-green-500/40 text-green-400 bg-green-500/10">Converted</Badge>;
      case "lost":
        return <Badge variant="outline" className="border-zinc-700 text-zinc-500 bg-zinc-800/40">Lost</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    startTransition(async () => {
      const res = await createLead({
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || undefined,
        company_name: formData.company_name || undefined,
        division_id: formData.division_id,
        service_interest_id: formData.service_interest_id || undefined,
        estimated_value: formData.estimated_value ? parseFloat(formData.estimated_value) : undefined,
        source: formData.source || "Website",
        notes: formData.notes || undefined,
      });

      if (res.error) {
        setCreateError(res.error);
      } else if (res.lead) {
        setLeads((prev) => [res.lead!, ...prev]);
        setIsCreateOpen(false);
        setFormData({
          first_name: "",
          last_name: "",
          email: "",
          phone: "",
          company_name: "",
          division_id: divisions[0]?.id || "",
          service_interest_id: "",
          estimated_value: "",
          source: "Website",
          notes: "",
        });
      }
    });
  };

  const handleStatusChange = (leadId: string, newStatus: LeadStatus) => {
    startTransition(async () => {
      const res = await updateLeadStatus(leadId, newStatus);
      if (res.success) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
      }
    });
  };

  const openConvertModal = (lead: LeadRow) => {
    setConvertLead(lead);
    setConvertData({
      companyName: lead.company_name || `${lead.first_name} ${lead.last_name} Corp`,
      contactPerson: `${lead.first_name} ${lead.last_name}`,
      email: lead.email,
      phone: lead.phone || "",
      industry: "General Enterprise",
      dealValue: lead.estimated_value ? String(lead.estimated_value) : "5000",
    });
    setConvertError("");
  };

  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!convertLead) return;
    setConvertError("");
    startTransition(async () => {
      const res = await convertLeadToClient({
        leadId: convertLead.id,
        companyName: convertData.companyName,
        contactPerson: convertData.contactPerson,
        email: convertData.email,
        phone: convertData.phone || undefined,
        industry: convertData.industry,
        divisionId: convertLead.division_id,
        dealValue: convertData.dealValue ? parseFloat(convertData.dealValue) : 5000,
      });

      if (res.error) {
        setConvertError(res.error);
      } else {
        setLeads((prev) =>
          prev.map((l) => (l.id === convertLead.id ? { ...l, status: "converted" } : l))
        );
        setConvertLead(null);
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this lead record?")) return;
    startTransition(async () => {
      const res = await deleteLead(id);
      if (res.success) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Leads Management"
        description="Capture, qualify, and route prospective clients across Aurtwiz Technologies' 7 business divisions."
        breadcrumbs={[{ label: "Business" }, { label: "Leads", current: true }]}
        badge={<Badge variant="outline">Pipeline Stage 1</Badge>}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Add New Lead
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Total Inbound Leads</span>
            <Building2 className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">{totalLeads}</div>
          <p className="text-xs text-zinc-500 mt-1">Across all 7 divisions</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">New Unassigned</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{newLeads}</div>
          <p className="text-xs text-zinc-500 mt-1">Pending first contact</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Qualified Leads</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{qualifiedLeads}</div>
          <p className="text-xs text-zinc-500 mt-1">Ready for proposal</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Est. Pipeline Value</span>
            <DollarSign className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">
            ${totalPipelineEst.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Active prospective deal value</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search leads by name, company, email..."
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
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="qualified">Qualified</option>
            <option value="proposal_sent">Proposal Sent</option>
            <option value="converted">Converted</option>
            <option value="lost">Lost</option>
          </Select>
        </div>
      </div>

      {/* Leads Table */}
      {filteredLeads.length === 0 ? (
        <EmptyState
          icon={UserPlus}
          title={leads.length === 0 ? "No Leads Recorded Yet" : "No Matching Leads Found"}
          description={
            leads.length === 0
              ? "Capture prospective inbound clients from web inquiries, campaign ads, or referral networks."
              : "Try adjusting your search criteria or division filters."
          }
          action={
            leads.length === 0
              ? {
                  label: "Add First Lead",
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
                <TableHead>Lead Contact</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Est. Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLeads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="font-medium text-zinc-100">
                      {lead.first_name} {lead.last_name}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {lead.email}
                      </span>
                      {lead.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {lead.phone}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-zinc-200">
                      {lead.company_name || <span className="text-zinc-500 italic">Individual</span>}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium px-2 py-0.5 rounded border border-zinc-800 bg-zinc-800/40 text-zinc-300">
                      {getDivisionName(lead.division_id)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-zinc-200">
                      {lead.estimated_value ? `$${lead.estimated_value.toLocaleString()}` : "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(lead.status)}
                      {lead.status !== "converted" && (
                        <select
                          value={lead.status}
                          disabled={isPending}
                          onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                          className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-1.5 py-0.5"
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="qualified">Qualified</option>
                          <option value="proposal_sent">Proposal</option>
                          <option value="lost">Lost</option>
                        </select>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs text-zinc-400 capitalize">{lead.source || "Website"}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {lead.status !== "converted" && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openConvertModal(lead)}
                          className="h-8 gap-1.5 text-xs text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50"
                        >
                          <ArrowRightCircle className="h-3.5 w-3.5" />
                          Convert
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(lead.id)}
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

      {/* CREATE LEAD MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Add New Prospective Lead"
        description="Register an inbound prospect into the business pipeline."
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
              <label className="block text-xs font-medium text-zinc-400 mb-1">First Name *</label>
              <Input
                required
                value={formData.first_name}
                onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                placeholder="Jane"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Last Name *</label>
              <Input
                required
                value={formData.last_name}
                onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                placeholder="Doe"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Email Address *</label>
              <Input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="jane@company.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Phone Number</label>
              <Input
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Company / Organization</label>
              <Input
                value={formData.company_name}
                onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                placeholder="Acme Global Inc."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Target Division *</label>
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
              <label className="block text-xs font-medium text-zinc-400 mb-1">Estimated Budget ($)</label>
              <Input
                type="number"
                min="0"
                value={formData.estimated_value}
                onChange={(e) => setFormData({ ...formData, estimated_value: e.target.value })}
                placeholder="10000"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Lead Source</label>
              <Select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              >
                <option value="Website">Website Form</option>
                <option value="Referral">Client Referral</option>
                <option value="FiveM Marketplace">FiveM Marketplace</option>
                <option value="Social Ads">Social Ad Campaign</option>
                <option value="Direct Outreach">Direct Outreach</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Specific Service</label>
              <Select
                value={formData.service_interest_id}
                onChange={(e) => setFormData({ ...formData, service_interest_id: e.target.value })}
              >
                <option value="">General Inquiry</option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Inquiry Details / Notes</label>
            <Textarea
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Client requirements, timeline expectations, initial scope..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Create Lead"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* CONVERT TO CLIENT MODAL */}
      <Modal
        isOpen={!!convertLead}
        onClose={() => setConvertLead(null)}
        title="Convert Lead to Corporate Client"
        description="Creates an active Client account and initiates a Sales Deal in the Pipeline."
        size="md"
      >
        <form onSubmit={handleConvertSubmit} className="space-y-4">
          {convertError && (
            <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {convertError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Company Name *</label>
            <Input
              required
              value={convertData.companyName}
              onChange={(e) => setConvertData({ ...convertData, companyName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Primary Contact *</label>
              <Input
                required
                value={convertData.contactPerson}
                onChange={(e) => setConvertData({ ...convertData, contactPerson: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Contact Email *</label>
              <Input
                type="email"
                required
                value={convertData.email}
                onChange={(e) => setConvertData({ ...convertData, email: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Industry Sector</label>
              <Input
                value={convertData.industry}
                onChange={(e) => setConvertData({ ...convertData, industry: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Deal Value ($)</label>
              <Input
                type="number"
                min="0"
                value={convertData.dealValue}
                onChange={(e) => setConvertData({ ...convertData, dealValue: e.target.value })}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setConvertLead(null)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-500 text-white">
              {isPending ? "Converting..." : "Confirm Conversion"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

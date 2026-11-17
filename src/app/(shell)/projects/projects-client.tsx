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
  FolderKanban,
  Plus,
  Search,
  Calendar,
  Building2,
  DollarSign,
  CheckCircle2,
  Clock,
  PauseCircle,
  Trash2,
  Layers,
} from "lucide-react";
import {
  createProject,
  updateProjectStatus,
  deleteProject,
  type ProjectRow,
} from "@/lib/actions/projects";
import type { ClientRow } from "@/lib/actions/clients";
import type { DivisionRow } from "@/lib/actions/divisions";
import type { ProfileRow } from "@/lib/actions/team";
import type { ProjectStatus } from "@/types/database";
import Link from "next/link";

interface ProjectsClientProps {
  initialProjects: ProjectRow[];
  clients: ClientRow[];
  divisions: DivisionRow[];
  profiles: ProfileRow[];
}

export function ProjectsClient({
  initialProjects,
  clients,
  divisions,
  profiles,
}: ProjectsClientProps) {
  const [projects, setProjects] = useState<ProjectRow[]>(initialProjects);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    code: `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
    title: "",
    description: "",
    client_id: clients[0]?.id || "",
    division_id: divisions[0]?.id || "",
    budget: "15000",
    start_date: new Date().toISOString().split("T")[0],
    target_completion_date: "",
    project_manager_id: "",
  });

  // Filtered projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      searchTerm === "" ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.code.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDivision =
      selectedDivision === "all" || p.division_id === selectedDivision;

    const matchesStatus =
      selectedStatus === "all" || p.status === selectedStatus;

    return matchesSearch && matchesDivision && matchesStatus;
  });

  // Metrics
  const activeProjects = projects.filter(
    (p) => p.status === "in_progress" || p.status === "planning" || p.status === "review"
  ).length;
  const completedProjects = projects.filter((p) => p.status === "completed").length;
  const onHoldProjects = projects.filter((p) => p.status === "on_hold").length;
  const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);

  const getClientName = (clientId: string) => {
    const c = clients.find((client) => client.id === clientId);
    return c ? c.company_name : "Direct Client";
  };

  const getDivisionName = (divId: string) => {
    const d = divisions.find((div) => div.id === divId);
    return d ? d.short_name || d.name : "Division";
  };

  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case "planning":
        return <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10">Planning</Badge>;
      case "in_progress":
        return <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10">In Progress</Badge>;
      case "review":
        return <Badge variant="outline" className="border-purple-500/40 text-purple-400 bg-purple-500/10">Review</Badge>;
      case "completed":
        return <Badge variant="outline" className="border-emerald-500/40 text-emerald-400 bg-emerald-500/10">Completed</Badge>;
      case "on_hold":
        return <Badge variant="outline" className="border-zinc-700 text-zinc-500 bg-zinc-800/40">On Hold</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    startTransition(async () => {
      const res = await createProject({
        code: formData.code,
        title: formData.title,
        description: formData.description || undefined,
        client_id: formData.client_id,
        division_id: formData.division_id,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        start_date: formData.start_date || undefined,
        target_completion_date: formData.target_completion_date || undefined,
        project_manager_id: formData.project_manager_id || undefined,
      });

      if (res.error) {
        setCreateError(res.error);
      } else if (res.project) {
        setProjects((prev) => [res.project!, ...prev]);
        setIsCreateOpen(false);
        setFormData({
          code: `PRJ-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`,
          title: "",
          description: "",
          client_id: clients[0]?.id || "",
          division_id: divisions[0]?.id || "",
          budget: "15000",
          start_date: new Date().toISOString().split("T")[0],
          target_completion_date: "",
          project_manager_id: "",
        });
      }
    });
  };

  const handleStatusChange = (projectId: string, newStatus: ProjectStatus) => {
    startTransition(async () => {
      const res = await updateProjectStatus(projectId, newStatus);
      if (res.success) {
        setProjects((prev) =>
          prev.map((p) => (p.id === projectId ? { ...p, status: newStatus } : p))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this project? Associated tasks will be affected.")) return;
    startTransition(async () => {
      const res = await deleteProject(id);
      if (res.success) {
        setProjects((prev) => prev.filter((p) => p.id !== id));
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects & Deliverables"
        description="Delivery tracking, milestone deadlines, and project management across all 7 business divisions."
        breadcrumbs={[{ label: "Business" }, { label: "Projects", current: true }]}
        badge={<Badge variant="outline">Delivery Engine</Badge>}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Client Project
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Active Deliverables</span>
            <Clock className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-blue-400">{activeProjects}</div>
          <p className="text-xs text-zinc-500 mt-1">Planning, active, and in review</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Completed Projects</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{completedProjects}</div>
          <p className="text-xs text-zinc-500 mt-1">Successfully fulfilled contracts</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">On Hold / Blocked</span>
            <PauseCircle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{onHoldProjects}</div>
          <p className="text-xs text-zinc-500 mt-1">Pending client input or review</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Committed Budget</span>
            <DollarSign className="h-4 w-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">
            ${totalBudget.toLocaleString("en-US", { minimumFractionDigits: 0 })}
          </div>
          <p className="text-xs text-zinc-500 mt-1">Aggregate client project budgets</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search projects by code or title..."
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
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="completed">Completed</option>
            <option value="on_hold">On Hold</option>
          </Select>
        </div>
      </div>

      {/* Projects Table */}
      {filteredProjects.length === 0 ? (
        <EmptyState
          icon={FolderKanban}
          title={projects.length === 0 ? "No Projects Active" : "No Matching Projects Found"}
          description={
            projects.length === 0
              ? "Create your first project deliverable or kick off a contract won in the Sales Pipeline."
              : "Try adjusting your search criteria or division filters."
          }
          action={
            projects.length === 0
              ? {
                  label: "Kickoff First Project",
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
                <TableHead>Project Code & Title</TableHead>
                <TableHead>Client Account</TableHead>
                <TableHead>Division</TableHead>
                <TableHead>Budget</TableHead>
                <TableHead>Target Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.map((project) => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="font-mono text-xs text-blue-400 font-semibold">{project.code}</div>
                    <div className="font-medium text-zinc-100 text-sm mt-0.5">{project.title}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-zinc-200">
                      <Building2 className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span>{getClientName(project.client_id)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs font-medium px-2 py-0.5 rounded border border-zinc-800 bg-zinc-800/40 text-zinc-300">
                      {getDivisionName(project.division_id)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="font-semibold text-zinc-200">
                      {project.budget ? `$${project.budget.toLocaleString()}` : "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-zinc-400 flex items-center gap-1">
                      <Calendar className="h-3 w-3 text-zinc-500" />
                      {project.target_completion_date ? project.target_completion_date : "Flexible"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <select
                      value={project.status}
                      disabled={isPending}
                      onChange={(e) => handleStatusChange(project.id, e.target.value as ProjectStatus)}
                      className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2 py-1"
                    >
                      <option value="planning">Planning</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="completed">Completed</option>
                      <option value="on_hold">On Hold</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/tasks`}
                        className="text-xs px-2.5 py-1 rounded-md border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
                      >
                        Tasks
                      </Link>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDelete(project.id)}
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

      {/* CREATE PROJECT MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Kickoff New Client Project"
        description="Establish deliverable scope, division assignment, and target completion dates."
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {createError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Project Code *</label>
              <Input
                required
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-zinc-400 mb-1">Project Title *</label>
              <Input
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="High-Performance FiveM Framework Redesign"
              />
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Budget Allocation ($)</label>
              <Input
                type="number"
                min="0"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Start Date</label>
              <Input
                type="date"
                value={formData.start_date}
                onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Target Completion</label>
              <Input
                type="date"
                value={formData.target_completion_date}
                onChange={(e) => setFormData({ ...formData, target_completion_date: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Project Scope & Deliverables</label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Milestones, deliverables, technical stack requirements, client specifications..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || clients.length === 0}>
              {isPending ? "Creating..." : "Kickoff Project"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

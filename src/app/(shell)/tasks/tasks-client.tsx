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
  CheckSquare,
  Plus,
  Search,
  Calendar,
  Clock,
  AlertTriangle,
  User,
  Trash2,
  FolderKanban,
  CheckCircle2,
  PauseCircle,
} from "lucide-react";
import {
  createTask,
  updateTaskStatus,
  deleteTask,
  type TaskRow,
} from "@/lib/actions/tasks";
import type { ProjectRow } from "@/lib/actions/projects";
import type { DivisionRow } from "@/lib/actions/divisions";
import type { ProfileRow } from "@/lib/actions/team";
import type { TaskPriority, TaskStatus } from "@/types/database";

interface TasksClientProps {
  initialTasks: TaskRow[];
  projects: ProjectRow[];
  divisions: DivisionRow[];
  profiles: ProfileRow[];
}

export function TasksClient({
  initialTasks,
  projects,
  divisions,
  profiles,
}: TasksClientProps) {
  const [tasks, setTasks] = useState<TaskRow[]>(initialTasks);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDivision, setSelectedDivision] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [selectedPriority, setSelectedPriority] = useState<string>("all");
  const [isPending, startTransition] = useTransition();

  // Create Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [createError, setCreateError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project_id: projects[0]?.id || "",
    division_id: divisions[0]?.id || "",
    priority: "medium" as TaskPriority,
    assigned_to: "",
    due_date: "",
    estimated_hours: "4",
  });

  // Filtered tasks
  const filteredTasks = tasks.filter((t) => {
    const matchesSearch =
      searchTerm === "" || t.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDivision =
      selectedDivision === "all" || t.division_id === selectedDivision;
    const matchesStatus =
      selectedStatus === "all" || t.status === selectedStatus;
    const matchesPriority =
      selectedPriority === "all" || t.priority === selectedPriority;

    return matchesSearch && matchesDivision && matchesStatus && matchesPriority;
  });

  // Metrics
  const totalTasks = tasks.length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const inReview = tasks.filter((t) => t.status === "in_review").length;
  const doneTasks = tasks.filter((t) => t.status === "done").length;

  const getProjectCode = (projectId: string) => {
    const p = projects.find((proj) => proj.id === projectId);
    return p ? p.code : "PRJ";
  };

  const getDivisionName = (divId: string) => {
    const d = divisions.find((div) => div.id === divId);
    return d ? d.short_name || d.name : "Division";
  };

  const getAssigneeName = (userId: string | null) => {
    if (!userId) return "Unassigned";
    const profile = profiles.find((p) => p.id === userId);
    return profile ? profile.full_name : "Team Member";
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    switch (priority) {
      case "urgent":
        return <Badge variant="outline" className="border-red-500/40 text-red-400 bg-red-500/10">Urgent</Badge>;
      case "high":
        return <Badge variant="outline" className="border-amber-500/40 text-amber-400 bg-amber-500/10">High</Badge>;
      case "medium":
        return <Badge variant="outline" className="border-blue-500/40 text-blue-400 bg-blue-500/10">Medium</Badge>;
      case "low":
        return <Badge variant="outline" className="border-zinc-700 text-zinc-400 bg-zinc-800/40">Low</Badge>;
      default:
        return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError("");
    startTransition(async () => {
      const res = await createTask({
        title: formData.title,
        description: formData.description || undefined,
        project_id: formData.project_id,
        division_id: formData.division_id,
        priority: formData.priority,
        assigned_to: formData.assigned_to || undefined,
        due_date: formData.due_date || undefined,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
      });

      if (res.error) {
        setCreateError(res.error);
      } else if (res.task) {
        setTasks((prev) => [res.task!, ...prev]);
        setIsCreateOpen(false);
        setFormData({
          title: "",
          description: "",
          project_id: projects[0]?.id || "",
          division_id: divisions[0]?.id || "",
          priority: "medium",
          assigned_to: "",
          due_date: "",
          estimated_hours: "4",
        });
      }
    });
  };

  const handleStatusChange = (taskId: string, newStatus: TaskStatus) => {
    startTransition(async () => {
      const res = await updateTaskStatus(taskId, newStatus);
      if (res.success) {
        setTasks((prev) =>
          prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
        );
      }
    });
  };

  const handleDelete = (id: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    startTransition(async () => {
      const res = await deleteTask(id);
      if (res.success) {
        setTasks((prev) => prev.filter((t) => t.id !== id));
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Tasks Management"
        description="Cross-division task assignments, sprint planning, and deadline oversight."
        breadcrumbs={[{ label: "Business" }, { label: "Tasks", current: true }]}
        badge={<Badge variant="outline">Execution Queue</Badge>}
        actions={
          <Button onClick={() => setIsCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Task
          </Button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Sprint Backlog</span>
            <CheckSquare className="h-4 w-4 text-zinc-500" />
          </div>
          <div className="text-2xl font-bold text-zinc-100">{totalTasks}</div>
          <p className="text-xs text-zinc-500 mt-1">Total queued sprint tasks</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Active Execution</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-400">{inProgress}</div>
          <p className="text-xs text-zinc-500 mt-1">Currently in progress</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Under Review / QA</span>
            <AlertTriangle className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-purple-400">{inReview}</div>
          <p className="text-xs text-zinc-500 mt-1">Awaiting PM / client signoff</p>
        </div>

        <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40">
          <div className="flex items-center justify-between text-zinc-400 mb-2">
            <span className="text-xs uppercase tracking-wider font-medium">Completed</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{doneTasks}</div>
          <p className="text-xs text-zinc-500 mt-1">Closed deliverables</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search tasks..."
            className="pl-9 bg-zinc-900/50 border-zinc-800 text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-48">
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

        <div className="w-full sm:w-36">
          <Select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-zinc-900/50 border-zinc-800 text-sm"
          >
            <option value="all">All Priorities</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </Select>
        </div>

        <div className="w-full sm:w-36">
          <Select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-zinc-900/50 border-zinc-800 text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="todo">Todo</option>
            <option value="in_progress">In Progress</option>
            <option value="in_review">In Review</option>
            <option value="done">Done</option>
            <option value="blocked">Blocked</option>
          </Select>
        </div>
      </div>

      {/* Tasks Table */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={tasks.length === 0 ? "No Tasks in Sprint" : "No Matching Tasks Found"}
          description={
            tasks.length === 0
              ? "Create actionable tasks under active projects and assign them to team members."
              : "Try adjusting your search criteria or status filters."
          }
          action={
            tasks.length === 0
              ? {
                  label: "Create First Task",
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
                <TableHead>Task Title & Scope</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Assignee</TableHead>
                <TableHead>Est. Hours</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTasks.map((task) => (
                <TableRow key={task.id}>
                  <TableCell>
                    <div className="font-medium text-zinc-100 text-sm">{task.title}</div>
                    {task.description && (
                      <div className="text-xs text-zinc-500 line-clamp-1 mt-0.5">
                        {task.description}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5 text-xs font-mono text-blue-400 font-medium">
                      <FolderKanban className="h-3 w-3 text-zinc-500" />
                      {getProjectCode(task.project_id)}
                    </div>
                  </TableCell>
                  <TableCell>{getPriorityBadge(task.priority)}</TableCell>
                  <TableCell>
                    <div className="text-xs text-zinc-300 flex items-center gap-1.5">
                      <User className="h-3.5 w-3.5 text-zinc-500" />
                      {getAssigneeName(task.assigned_to)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-xs text-zinc-400 font-mono">
                      {task.estimated_hours ? `${task.estimated_hours}h` : "—"}
                    </div>
                  </TableCell>
                  <TableCell>
                    <select
                      value={task.status}
                      disabled={isPending}
                      onChange={(e) => handleStatusChange(task.id, e.target.value as TaskStatus)}
                      className="text-xs bg-zinc-900 border border-zinc-800 text-zinc-300 rounded px-2 py-1"
                    >
                      <option value="todo">Todo</option>
                      <option value="in_progress">In Progress</option>
                      <option value="in_review">In Review</option>
                      <option value="done">Done</option>
                      <option value="blocked">Blocked</option>
                    </select>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(task.id)}
                      className="h-8 w-8 p-0 text-zinc-500 hover:text-red-400"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CREATE TASK MODAL */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Sprint Task"
        description="Assign a deliverable unit of work to a team member."
        size="lg"
      >
        <form onSubmit={handleCreateSubmit} className="space-y-4">
          {createError && (
            <div className="p-3 text-xs rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
              {createError}
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Task Title *</label>
            <Input
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Implement Lua client event handlers and sync with server"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Parent Project *</label>
              {projects.length > 0 ? (
                <Select
                  value={formData.project_id}
                  onChange={(e) => setFormData({ ...formData, project_id: e.target.value })}
                  required
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.code} — {p.title}
                    </option>
                  ))}
                </Select>
              ) : (
                <div className="text-xs text-amber-400 p-2 border border-amber-500/20 rounded-md bg-amber-500/10">
                  No projects available. Please create a project first in Projects module.
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
              <label className="block text-xs font-medium text-zinc-400 mb-1">Priority</label>
              <Select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Assignee</label>
              <Select
                value={formData.assigned_to}
                onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              >
                <option value="">Unassigned</option>
                {profiles.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name} ({p.role.replace("_", " ")})
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-400 mb-1">Estimated Hours</label>
              <Input
                type="number"
                min="0.5"
                step="0.5"
                value={formData.estimated_hours}
                onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Task Description / Acceptance Criteria</label>
            <Textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Technical instructions, acceptance conditions, links to mockups or documentation..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
            <Button type="button" variant="outline" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending || projects.length === 0}>
              {isPending ? "Creating..." : "Create Task"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

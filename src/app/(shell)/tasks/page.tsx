import React from "react";
import { getTasks } from "@/lib/actions/tasks";
import { getProjects } from "@/lib/actions/projects";
import { getDbDivisions } from "@/lib/actions/divisions";
import { getProfiles } from "@/lib/actions/team";
import { TasksClient } from "./tasks-client";

export const metadata = {
  title: "Tasks Management | Aurtwiz Business OS",
  description: "Cross-division task assignments, sprint planning, and deadline oversight.",
};

export default async function TasksPage() {
  const [tasks, projects, divisions, profiles] = await Promise.all([
    getTasks(),
    getProjects(),
    getDbDivisions(),
    getProfiles(),
  ]);

  return (
    <TasksClient
      initialTasks={tasks}
      projects={projects}
      divisions={divisions}
      profiles={profiles}
    />
  );
}

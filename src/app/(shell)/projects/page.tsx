import React from "react";
import { getProjects } from "@/lib/actions/projects";
import { getClients } from "@/lib/actions/clients";
import { getDbDivisions } from "@/lib/actions/divisions";
import { getProfiles } from "@/lib/actions/team";
import { ProjectsClient } from "./projects-client";

export const metadata = {
  title: "Projects & Deliverables | Aurtwiz Business OS",
  description: "Delivery tracking, milestone deadlines, and project management across all 7 business divisions.",
};

export default async function ProjectsPage() {
  const [projects, clients, divisions, profiles] = await Promise.all([
    getProjects(),
    getClients({ status: "all" }),
    getDbDivisions(),
    getProfiles(),
  ]);

  return (
    <ProjectsClient
      initialProjects={projects}
      clients={clients}
      divisions={divisions}
      profiles={profiles}
    />
  );
}

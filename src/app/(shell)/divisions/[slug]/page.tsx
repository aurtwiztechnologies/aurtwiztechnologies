import React from "react";
import { notFound } from "next/navigation";
import { DIVISIONS, getDivisionBySlug } from "@/config/divisions";
import { getDbDivisions } from "@/lib/actions/divisions";
import { getProjects } from "@/lib/actions/projects";
import { getLeads } from "@/lib/actions/leads";
import { getTasks } from "@/lib/actions/tasks";
import { getClients } from "@/lib/actions/clients";
import { DivisionWorkspaceClient } from "./division-workspace-client";

interface DivisionPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateStaticParams() {
  return DIVISIONS.map((division) => ({
    slug: division.slug,
  }));
}

export default async function DivisionDetailPage({ params }: DivisionPageProps) {
  const { slug } = await params;
  const division = getDivisionBySlug(slug);

  if (!division) {
    notFound();
  }

  // Lookup corresponding DB division record
  const dbDivisions = await getDbDivisions();
  const dbDivision = dbDivisions.find((d) => d.slug === slug);
  const divisionId = dbDivision?.id;

  const [projects, leads, tasks, clients] = await Promise.all([
    getProjects(divisionId ? { divisionId } : undefined),
    getLeads(divisionId ? { divisionId } : undefined),
    getTasks(divisionId ? { divisionId } : undefined),
    getClients(divisionId ? { divisionId, status: "all" } : { status: "all" }),
  ]);

  return (
    <DivisionWorkspaceClient
      division={division}
      projects={projects}
      leads={leads}
      tasks={tasks}
      clients={clients}
    />
  );
}

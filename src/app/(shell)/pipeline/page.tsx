import React from "react";
import { getDeals } from "@/lib/actions/deals";
import { getClients } from "@/lib/actions/clients";
import { getDbDivisions } from "@/lib/actions/divisions";
import { PipelineClient } from "./pipeline-client";

export const metadata = {
  title: "Sales Pipeline | Aurtwiz Business OS",
  description: "Visual Kanban deal progression, revenue forecasting, and close rates across divisions.",
};

export default async function PipelinePage() {
  const [deals, clients, divisions] = await Promise.all([
    getDeals(),
    getClients({ status: "all" }),
    getDbDivisions(),
  ]);

  return (
    <PipelineClient
      initialDeals={deals}
      clients={clients}
      divisions={divisions}
    />
  );
}

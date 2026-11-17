import React from "react";
import { getLeads } from "@/lib/actions/leads";
import { getDbDivisions } from "@/lib/actions/divisions";
import { getServices } from "@/lib/actions/services";
import { LeadsClient } from "./leads-client";

export const metadata = {
  title: "Leads Management | Aurtwiz Business OS",
  description: "Capture, qualify, and route prospective clients across Aurtwiz Technologies' 7 business divisions.",
};

export default async function LeadsPage() {
  const [leads, divisions, services] = await Promise.all([
    getLeads(),
    getDbDivisions(),
    getServices(),
  ]);

  return (
    <LeadsClient
      initialLeads={leads}
      divisions={divisions}
      services={services}
    />
  );
}

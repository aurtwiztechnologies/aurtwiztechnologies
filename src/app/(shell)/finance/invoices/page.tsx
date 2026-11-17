import React from "react";
import { getInvoices } from "@/lib/actions/finance";
import { getClients } from "@/lib/actions/clients";
import { getDbDivisions } from "@/lib/actions/divisions";
import { getProjects } from "@/lib/actions/projects";
import { InvoicesClient } from "./invoices-client";

export const metadata = {
  title: "Invoices | Aurtwiz Business OS",
  description: "Client billing, milestone invoicing, recurring contracts, and payment tracking.",
};

export default async function InvoicesPage() {
  const [invoices, clients, divisions, projects] = await Promise.all([
    getInvoices(),
    getClients({ status: "all" }),
    getDbDivisions(),
    getProjects(),
  ]);

  return (
    <InvoicesClient
      initialInvoices={invoices}
      clients={clients}
      divisions={divisions}
      projects={projects}
    />
  );
}

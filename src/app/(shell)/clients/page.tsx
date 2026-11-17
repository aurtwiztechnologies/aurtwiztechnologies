import React from "react";
import { getClients } from "@/lib/actions/clients";
import { getDbDivisions } from "@/lib/actions/divisions";
import { ClientsClient } from "./clients-client";

export const metadata = {
  title: "Clients Directory | Aurtwiz Business OS",
  description: "Corporate accounts, ongoing retainers, and client relationships across all business divisions.",
};

export default async function ClientsPage() {
  const [clients, divisions] = await Promise.all([
    getClients({ status: "all" }),
    getDbDivisions(),
  ]);

  return (
    <ClientsClient
      initialClients={clients}
      divisions={divisions}
    />
  );
}

import React from "react";
import { getInvoices, getPayments, getExpenses } from "@/lib/actions/finance";
import { getDeals } from "@/lib/actions/deals";
import { getProjects } from "@/lib/actions/projects";
import { getActivityLogs } from "@/lib/actions/activity";
import { getDbDivisions } from "@/lib/actions/divisions";
import { ReportsClient } from "./reports-client";

export const metadata = {
  title: "Reports & Analytics | Aurtwiz Business OS",
  description: "Cross-division revenue attribution, project velocity, pipeline conversion, and profit margins.",
};

export default async function ReportsPage() {
  const [invoices, payments, expenses, deals, projects, activityLogs, divisions] =
    await Promise.all([
      getInvoices(),
      getPayments(),
      getExpenses(),
      getDeals(),
      getProjects(),
      getActivityLogs(50),
      getDbDivisions(),
    ]);

  return (
    <ReportsClient
      invoices={invoices}
      payments={payments}
      expenses={expenses}
      deals={deals}
      projects={projects}
      activityLogs={activityLogs}
      divisions={divisions}
    />
  );
}

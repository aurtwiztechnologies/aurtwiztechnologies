import React from "react";
import { getPayments, getInvoices } from "@/lib/actions/finance";
import { PaymentsClient } from "./payments-client";

export const metadata = {
  title: "Payments Ledger | Aurtwiz Business OS",
  description: "Inbound client settlements, transaction logs, and payment reconciliation across divisions.",
};

export default async function PaymentsPage() {
  const [payments, invoices] = await Promise.all([
    getPayments(),
    getInvoices(),
  ]);

  return (
    <PaymentsClient
      initialPayments={payments}
      invoices={invoices}
    />
  );
}

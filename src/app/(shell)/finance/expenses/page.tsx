import React from "react";
import { getExpenses } from "@/lib/actions/finance";
import { getDbDivisions } from "@/lib/actions/divisions";
import { ExpensesClient } from "./expenses-client";

export const metadata = {
  title: "Expenses Management | Aurtwiz Business OS",
  description: "Operating costs, software subscriptions, contractor payouts, and division budgets.",
};

export default async function ExpensesPage() {
  const [expenses, divisions] = await Promise.all([
    getExpenses(),
    getDbDivisions(),
  ]);

  return (
    <ExpensesClient
      initialExpenses={expenses}
      divisions={divisions}
    />
  );
}

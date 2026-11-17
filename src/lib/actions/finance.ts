"use server";

import { createServerSupabaseClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activity";
import type { Database, InvoiceStatus, PaymentStatus, ExpenseCategory } from "@/types/database";

export type InvoiceRow = Database["public"]["Tables"]["invoices"]["Row"];
export type PaymentRow = Database["public"]["Tables"]["payments"]["Row"];
export type ExpenseRow = Database["public"]["Tables"]["expenses"]["Row"];

/* ==========================================================================
   INVOICES
   ========================================================================== */

export async function getInvoices(params?: {
  divisionId?: string;
  status?: InvoiceStatus;
  clientId?: string;
}): Promise<InvoiceRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("invoices").select("*").order("created_at", { ascending: false });

    if (params?.divisionId && params.divisionId !== "all") {
      query = query.eq("division_id", params.divisionId);
    }
    if (params?.status) {
      query = query.eq("status", params.status);
    }
    if (params?.clientId) {
      query = query.eq("client_id", params.clientId);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as InvoiceRow[]) || [];
  } catch {
    return [];
  }
}

export async function createInvoice(formData: {
  invoice_number: string;
  client_id: string;
  project_id?: string;
  division_id: string;
  subtotal: number;
  tax?: number;
  issue_date: string;
  due_date: string;
  notes?: string;
}): Promise<{ success?: boolean; error?: string; invoice?: InvoiceRow }> {
  try {
    const supabase = await createServerSupabaseClient();
    const tax = formData.tax || 0;
    const total_amount = formData.subtotal + tax;

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: formData.invoice_number,
        client_id: formData.client_id,
        project_id: formData.project_id || null,
        division_id: formData.division_id,
        subtotal: formData.subtotal,
        tax,
        total_amount,
        status: "draft",
        issue_date: formData.issue_date,
        due_date: formData.due_date,
        notes: formData.notes || null,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const invoice = data as InvoiceRow;
    await logActivity({
      action: "Issued billing invoice",
      entityType: "invoice",
      entityId: invoice.id,
      divisionId: invoice.division_id,
      metadata: { invoice_number: invoice.invoice_number, total: invoice.total_amount },
    });

    revalidatePath("/finance/invoices");
    revalidatePath("/dashboard");
    return { success: true, invoice };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to create invoice." };
  }
}

export async function updateInvoiceStatus(
  id: string,
  status: InvoiceStatus
): Promise<{ success?: boolean; error?: string }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase
      .from("invoices")
      .update({ status })
      .eq("id", id);

    if (error) return { error: error.message };

    await logActivity({
      action: `Updated invoice status to ${status}`,
      entityType: "invoice",
      entityId: id,
    });

    revalidatePath("/finance/invoices");
    revalidatePath("/dashboard");
    return { success: true };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to update invoice status." };
  }
}

/* ==========================================================================
   PAYMENTS
   ========================================================================== */

export async function getPayments(params?: {
  clientId?: string;
  status?: PaymentStatus;
}): Promise<PaymentRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("payments").select("*").order("received_at", { ascending: false });

    if (params?.clientId) {
      query = query.eq("client_id", params.clientId);
    }
    if (params?.status) {
      query = query.eq("status", params.status);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as PaymentRow[]) || [];
  } catch {
    return [];
  }
}

export async function recordPayment(formData: {
  invoice_id?: string;
  client_id: string;
  amount: number;
  currency?: string;
  payment_method: string;
  transaction_reference: string;
}): Promise<{ success?: boolean; error?: string; payment?: PaymentRow }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from("payments")
      .insert({
        invoice_id: formData.invoice_id || null,
        client_id: formData.client_id,
        amount: formData.amount,
        currency: formData.currency || "USD",
        payment_method: formData.payment_method,
        transaction_reference: formData.transaction_reference,
        status: "completed",
        received_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const payment = data as PaymentRow;

    // Automatically mark invoice as paid if reconciled
    if (formData.invoice_id) {
      await supabase
        .from("invoices")
        .update({ status: "paid" })
        .eq("id", formData.invoice_id);
    }

    // Increment client total_revenue
    try {
      const { data: client } = await supabase
        .from("clients")
        .select("total_revenue")
        .eq("id", formData.client_id)
        .single();
      if (client) {
        const currentRev = Number((client as { total_revenue?: number })?.total_revenue || 0);
        await supabase
          .from("clients")
          .update({ total_revenue: currentRev + formData.amount })
          .eq("id", formData.client_id);
      }
    } catch {
      // Non-blocking
    }

    await logActivity({
      action: "Recorded payment transaction",
      entityType: "payment",
      entityId: payment.id,
      metadata: {
        reference: payment.transaction_reference,
        amount: payment.amount,
        invoice_id: payment.invoice_id,
      },
    });

    revalidatePath("/finance/payments");
    revalidatePath("/finance/invoices");
    revalidatePath("/clients");
    revalidatePath("/dashboard");
    return { success: true, payment };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to record payment." };
  }
}

/* ==========================================================================
   EXPENSES
   ========================================================================== */

export async function getExpenses(params?: {
  divisionId?: string;
  category?: ExpenseCategory;
}): Promise<ExpenseRow[]> {
  try {
    const supabase = await createServerSupabaseClient();
    let query = supabase.from("expenses").select("*").order("incurred_date", { ascending: false });

    if (params?.divisionId && params.divisionId !== "all") {
      query = query.eq("division_id", params.divisionId);
    }
    if (params?.category) {
      query = query.eq("category", params.category);
    }

    const { data, error } = await query;
    if (error) return [];
    return (data as ExpenseRow[]) || [];
  } catch {
    return [];
  }
}

export async function createExpense(formData: {
  division_id?: string;
  category: ExpenseCategory;
  amount: number;
  currency?: string;
  vendor: string;
  description: string;
  incurred_date: string;
  receipt_url?: string;
}): Promise<{ success?: boolean; error?: string; expense?: ExpenseRow }> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) return { error: "Authentication required to submit expenses." };

    const { data, error } = await supabase
      .from("expenses")
      .insert({
        division_id: formData.division_id || null,
        category: formData.category,
        amount: formData.amount,
        currency: formData.currency || "USD",
        vendor: formData.vendor,
        description: formData.description,
        incurred_date: formData.incurred_date,
        receipt_url: formData.receipt_url || null,
        created_by: user.id,
      })
      .select()
      .single();

    if (error) return { error: error.message };

    const expense = data as ExpenseRow;
    await logActivity({
      action: "Submitted operational expense claim",
      entityType: "expense",
      entityId: expense.id,
      divisionId: expense.division_id,
      metadata: { vendor: expense.vendor, amount: expense.amount },
    });

    revalidatePath("/finance/expenses");
    revalidatePath("/dashboard");
    return { success: true, expense };
  } catch (err: unknown) {
    return { error: err instanceof Error ? err.message : "Failed to submit expense." };
  }
}

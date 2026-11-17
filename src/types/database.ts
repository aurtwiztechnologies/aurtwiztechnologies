/**
 * AURTWIZ BUSINESS OS - Database Type Definitions
 * 
 * Strict TypeScript representation of PostgreSQL / Supabase entities
 * supporting all 7 business divisions and enterprise operations.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type LeadStatus = "new" | "contacted" | "qualified" | "proposal_sent" | "converted" | "lost";
export type DealStage = "discovery" | "demo" | "proposal" | "negotiation" | "won" | "lost";
export type ProjectStatus = "planning" | "in_progress" | "review" | "completed" | "on_hold";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskStatus = "todo" | "in_progress" | "in_review" | "done" | "blocked";
export type InvoiceStatus = "draft" | "issued" | "paid" | "overdue" | "cancelled";
export type PaymentStatus = "pending" | "completed" | "failed" | "refunded";
export type ExpenseCategory = "software_licenses" | "hardware" | "contractors" | "marketing" | "office" | "travel" | "miscellaneous";
export type SystemRole = "super_admin" | "division_head" | "project_manager" | "finance_manager" | "sales_executive" | "team_member";

export type GenericRelationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne?: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string;
          avatar_url: string | null;
          job_title: string;
          role: string;
          primary_division_id: string | null;
          phone: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name: string;
          avatar_url?: string | null;
          job_title?: string;
          role?: string;
          primary_division_id?: string | null;
          phone?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      divisions: {
        Row: {
          id: string;
          slug: string;
          name: string;
          short_name: string;
          code: string;
          description: string;
          color: string;
          lead_user_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          short_name: string;
          code: string;
          description: string;
          color: string;
          lead_user_id?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["divisions"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      roles: {
        Row: {
          id: string;
          name: string;
          description: string;
          permissions: string[];
          created_at: string;
        };
        Insert: {
          id: string;
          name: string;
          description: string;
          permissions?: string[];
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["roles"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      user_divisions: {
        Row: {
          id: string;
          user_id: string;
          division_id: string;
          role: string;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          division_id: string;
          role?: string;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["user_divisions"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      team_members: {
        Row: {
          id: string;
          user_id: string;
          division_id: string;
          role: string;
          joined_date: string;
          allocation_percentage: number;
          status: "active" | "leave" | "terminated";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          division_id: string;
          role?: string;
          joined_date?: string;
          allocation_percentage?: number;
          status?: "active" | "leave" | "terminated";
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["team_members"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      services: {
        Row: {
          id: string;
          division_id: string;
          name: string;
          description: string | null;
          base_price: number | null;
          currency: string;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          division_id: string;
          name: string;
          description?: string | null;
          base_price?: number | null;
          currency?: string;
          status?: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["services"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      leads: {
        Row: {
          id: string;
          first_name: string;
          last_name: string;
          email: string;
          phone: string | null;
          company_name: string | null;
          division_id: string;
          service_interest_id: string | null;
          source: string;
          status: LeadStatus;
          assigned_to: string | null;
          estimated_value: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          first_name: string;
          last_name: string;
          email: string;
          phone?: string | null;
          company_name?: string | null;
          division_id: string;
          service_interest_id?: string | null;
          source?: string;
          status?: LeadStatus;
          assigned_to?: string | null;
          estimated_value?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["leads"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      clients: {
        Row: {
          id: string;
          company_name: string;
          contact_person: string;
          email: string;
          phone: string | null;
          website: string | null;
          industry: string | null;
          status: "active" | "inactive" | "lead";
          total_revenue: number;
          primary_division_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_name: string;
          contact_person: string;
          email: string;
          phone?: string | null;
          website?: string | null;
          industry?: string | null;
          status?: "active" | "inactive" | "lead";
          total_revenue?: number;
          primary_division_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      deals: {
        Row: {
          id: string;
          title: string;
          client_id: string;
          division_id: string;
          stage: DealStage;
          value: number;
          expected_close_date: string | null;
          assigned_to: string | null;
          probability: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          client_id: string;
          division_id: string;
          stage?: DealStage;
          value: number;
          expected_close_date?: string | null;
          assigned_to?: string | null;
          probability?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["deals"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      projects: {
        Row: {
          id: string;
          code: string;
          title: string;
          description: string | null;
          client_id: string;
          division_id: string;
          status: ProjectStatus;
          start_date: string | null;
          target_completion_date: string | null;
          budget: number | null;
          project_manager_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          title: string;
          description?: string | null;
          client_id: string;
          division_id: string;
          status?: ProjectStatus;
          start_date?: string | null;
          target_completion_date?: string | null;
          budget?: number | null;
          project_manager_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      tasks: {
        Row: {
          id: string;
          project_id: string;
          division_id: string;
          title: string;
          description: string | null;
          status: TaskStatus;
          priority: TaskPriority;
          assigned_to: string | null;
          due_date: string | null;
          estimated_hours: number | null;
          actual_hours: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          division_id: string;
          title: string;
          description?: string | null;
          status?: TaskStatus;
          priority?: TaskPriority;
          assigned_to?: string | null;
          due_date?: string | null;
          estimated_hours?: number | null;
          actual_hours?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tasks"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      invoices: {
        Row: {
          id: string;
          invoice_number: string;
          client_id: string;
          project_id: string | null;
          division_id: string;
          subtotal: number;
          tax: number;
          total_amount: number;
          status: InvoiceStatus;
          issue_date: string;
          due_date: string;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          invoice_number: string;
          client_id: string;
          project_id?: string | null;
          division_id: string;
          subtotal: number;
          tax?: number;
          total_amount: number;
          status?: InvoiceStatus;
          issue_date: string;
          due_date: string;
          notes?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["invoices"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      payments: {
        Row: {
          id: string;
          invoice_id: string | null;
          client_id: string;
          amount: number;
          currency: string;
          payment_method: string;
          transaction_reference: string;
          status: PaymentStatus;
          received_at: string;
        };
        Insert: {
          id?: string;
          invoice_id?: string | null;
          client_id: string;
          amount: number;
          currency?: string;
          payment_method: string;
          transaction_reference: string;
          status?: PaymentStatus;
          received_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payments"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      expenses: {
        Row: {
          id: string;
          division_id: string | null;
          category: ExpenseCategory;
          amount: number;
          currency: string;
          vendor: string;
          description: string;
          incurred_date: string;
          receipt_url: string | null;
          created_by: string;
        };
        Insert: {
          id?: string;
          division_id?: string | null;
          category: ExpenseCategory;
          amount: number;
          currency?: string;
          vendor: string;
          description: string;
          incurred_date: string;
          receipt_url?: string | null;
          created_by: string;
        };
        Update: Partial<Database["public"]["Tables"]["expenses"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      products: {
        Row: {
          id: string;
          division_id: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          product_type: "fivem_script" | "digital_asset" | "template" | "service_package";
          is_active: boolean;
          download_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          division_id: string;
          name: string;
          slug: string;
          description: string;
          price: number;
          product_type: "fivem_script" | "digital_asset" | "template" | "service_package";
          is_active?: boolean;
          download_url?: string | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          product_id: string;
          customer_email: string;
          customer_name: string;
          amount_paid: number;
          status: "pending" | "completed" | "refunded";
          created_at: string;
        };
        Insert: {
          id?: string;
          order_number: string;
          product_id: string;
          customer_email: string;
          customer_name: string;
          amount_paid: number;
          status?: "pending" | "completed" | "refunded";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      campaigns: {
        Row: {
          id: string;
          client_id: string;
          division_id: string;
          name: string;
          channel: string;
          budget: number;
          spend: number;
          conversions: number;
          status: "draft" | "active" | "paused" | "completed";
          start_date: string;
          end_date: string | null;
        };
        Insert: {
          id?: string;
          client_id: string;
          division_id: string;
          name: string;
          channel: string;
          budget: number;
          spend?: number;
          conversions?: number;
          status?: "draft" | "active" | "paused" | "completed";
          start_date: string;
          end_date?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["campaigns"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      media_projects: {
        Row: {
          id: string;
          project_id: string;
          division_id: string;
          shoot_date: string | null;
          deliverable_format: string;
          production_stage: "pre_production" | "production" | "post_production" | "final_delivery";
          assets_drive_url: string | null;
        };
        Insert: {
          id?: string;
          project_id: string;
          division_id: string;
          shoot_date?: string | null;
          deliverable_format: string;
          production_stage: "pre_production" | "production" | "post_production" | "final_delivery";
          assets_drive_url?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["media_projects"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      esports_events: {
        Row: {
          id: string;
          name: string;
          game_title: string;
          prize_pool: number;
          format: "online" | "lan" | "hybrid";
          start_date: string;
          end_date: string;
          participants_count: number;
          status: "upcoming" | "live" | "completed";
        };
        Insert: {
          id?: string;
          name: string;
          game_title: string;
          prize_pool: number;
          format: "online" | "lan" | "hybrid";
          start_date: string;
          end_date: string;
          participants_count?: number;
          status?: "upcoming" | "live" | "completed";
        };
        Update: Partial<Database["public"]["Tables"]["esports_events"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          division_id: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          action: string;
          entity_type: string;
          entity_id: string;
          division_id?: string | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["activity_logs"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          message: string;
          link: string | null;
          is_read: boolean;
          type: "system" | "task" | "project" | "finance" | "mention";
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          message: string;
          link?: string | null;
          is_read?: boolean;
          type?: "system" | "task" | "project" | "finance" | "mention";
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Insert"]>;
        Relationships: GenericRelationship[];
      };
    };
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Relationships: GenericRelationship[];
      };
    };
    Functions: {
      [key: string]: {
        Args: Record<string, unknown>;
        Returns: unknown;
      };
    };
    Enums: {
      [key: string]: unknown;
    };
    CompositeTypes: {
      [key: string]: unknown;
    };
  };
};

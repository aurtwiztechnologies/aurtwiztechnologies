-- ==============================================================================
-- AURTWIZ BUSINESS OS — PRODUCTION-HARDENED DATABASE SCHEMA
-- ==============================================================================
-- COMPANY: Aurtwiz Technologies
-- ARCHITECTURE: Single-Company Internal Business OS
-- STAGE: Production-Ready Database Schema & Complete Security Hardening
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTENSIONS
-- ------------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ------------------------------------------------------------------------------
-- 2. ENUM TYPES
-- ------------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE system_role AS ENUM (
    'super_admin',
    'division_head',
    'project_manager',
    'finance_manager',
    'sales_executive',
    'team_member'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE lead_status AS ENUM (
    'new',
    'contacted',
    'qualified',
    'proposal_sent',
    'converted',
    'lost'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE deal_stage AS ENUM (
    'discovery',
    'demo',
    'proposal',
    'negotiation',
    'won',
    'lost'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE project_status AS ENUM (
    'planning',
    'in_progress',
    'review',
    'completed',
    'on_hold'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'blocked');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE invoice_status AS ENUM ('draft', 'issued', 'paid', 'overdue', 'cancelled');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ------------------------------------------------------------------------------
-- 3. CORE ENTITIES: DIVISIONS, ROLES & PROFILES
-- ------------------------------------------------------------------------------

-- Divisions (The 7 Core Business Divisions of Aurtwiz Technologies)
CREATE TABLE IF NOT EXISTS public.divisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_name TEXT NOT NULL,
  code VARCHAR(10) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  color VARCHAR(20) NOT NULL,
  lead_user_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Roles (Reference Table for Role Hierarchy & Granular Permissions)
CREATE TABLE IF NOT EXISTS public.roles (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  permissions TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Initial 6 Roles
INSERT INTO public.roles (id, name, description, permissions)
VALUES
  ('super_admin', 'Super Admin', 'Complete cross-division authority, finance, team, and settings', ARRAY['*']),
  ('division_head', 'Division Head', 'Oversight of designated division services, projects, tasks, team, and leads', ARRAY['division:read', 'division:write', 'projects:all_division', 'tasks:all_division', 'team:division', 'leads:division', 'reports:division']),
  ('project_manager', 'Project Manager', 'Project deliverables, milestone timelines, task assignments, and client read access', ARRAY['projects:read', 'projects:write', 'tasks:read', 'tasks:write', 'clients:read']),
  ('finance_manager', 'Finance Manager', 'Invoices, payments, operational expenses, and company financial reporting', ARRAY['finance:read', 'finance:write', 'invoices:manage', 'payments:manage', 'expenses:manage', 'reports:financial']),
  ('sales_executive', 'Sales Executive', 'Leads pipeline, deals, client accounts, and conversion opportunities', ARRAY['leads:read', 'leads:write', 'clients:read', 'clients:write', 'pipeline:read', 'pipeline:write']),
  ('team_member', 'Team Member', 'Assigned tasks, project collaboration, and personal profile updates', ARRAY['tasks:assigned', 'projects:assigned', 'profile:own'])
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name, description = EXCLUDED.description, permissions = EXCLUDED.permissions;

-- Seed Initial 7 Divisions
INSERT INTO public.divisions (slug, name, short_name, code, description, color)
VALUES
  ('technology', 'Technology & Development', 'Technology', 'TECH', 'Enterprise web solutions, AI workflows, bespoke software, and process automation.', '#3b82f6'),
  ('creative-design', 'Creative & Design', 'Creative & Design', 'CRTV', 'High-impact video editing, visual design systems, brand identities, and product UX.', '#ec4899'),
  ('digital-marketing', 'Digital Marketing & Growth', 'Digital Marketing', 'MKTG', 'Performance ad campaigns, social organic growth, content strategy, and conversion copywriting.', '#f59e0b'),
  ('media-house', 'Media House', 'Media House', 'MDIA', 'Commercial video production, brand films, creative shoots, and digital media production.', '#8b5cf6'),
  ('gaming-esports', 'Gaming & Esports', 'Gaming & Esports', 'GAMS', 'Competitive gaming tournament management, team rosters, and esports community hubs.', '#10b981'),
  ('gaming-marketplace', 'Gaming Development & Marketplace', 'Gaming Marketplace', 'MKT', 'FiveM server scripts, digital script marketplace, game modding, and specialized server solutions.', '#06b6d4'),
  ('freelancing', 'Freelancing Agency', 'Freelancing', 'FREE', 'Outsourced talent pipelines, contract project delivery, remote team coordination, and client acquisition.', '#6366f1')
ON CONFLICT (slug) DO NOTHING;

-- User Profiles (Linked to auth.users in Supabase)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  job_title TEXT NOT NULL DEFAULT 'Staff Member',
  role system_role NOT NULL DEFAULT 'team_member',
  primary_division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Add Circular Foreign Key: divisions.lead_user_id -> profiles.id
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_divisions_lead_user'
  ) THEN
    ALTER TABLE public.divisions
      ADD CONSTRAINT fk_divisions_lead_user
      FOREIGN KEY (lead_user_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ------------------------------------------------------------------------------
-- 4. MULTI-DIVISION TEAM MEMBERSHIP
-- ------------------------------------------------------------------------------

-- User Divisions (Clean Junction Table for Multi-Division Memberships)
CREATE TABLE IF NOT EXISTS public.user_divisions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  role system_role NOT NULL DEFAULT 'team_member',
  is_primary BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, division_id)
);

-- Team Members (Staff Directory & Contractor Allocation Roster)
CREATE TABLE IF NOT EXISTS public.team_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  role VARCHAR(50) NOT NULL DEFAULT 'team_member',
  joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
  allocation_percentage NUMERIC(5,2) NOT NULL DEFAULT 100.00,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Services Catalog (All 30 Standardized Offerings across Divisions)
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(12,2),
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 5. BUSINESS & CRM ENTITIES
-- ------------------------------------------------------------------------------

-- Corporate Clients
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  industry TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  total_revenue NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  primary_division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Inbound & Prospective Leads
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
  service_interest_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  source VARCHAR(50) NOT NULL DEFAULT 'website',
  status lead_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  estimated_value NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Sales Deals & Pipeline
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
  stage deal_stage NOT NULL DEFAULT 'discovery',
  value NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  expected_close_date DATE,
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  probability INT NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Client Projects & Delivery Milestones
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
  status project_status NOT NULL DEFAULT 'planning',
  start_date DATE,
  target_completion_date DATE,
  budget NUMERIC(14,2),
  project_manager_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Project Tasks & Sprint Backlogs
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  due_date DATE,
  estimated_hours NUMERIC(6,2),
  actual_hours NUMERIC(6,2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 6. FINANCE & TREASURY
-- ------------------------------------------------------------------------------

-- Invoices (Client Billing Records - Preserves Financial History)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
  subtotal NUMERIC(14,2) NOT NULL,
  tax NUMERIC(14,2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(14,2) NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Payments (Received Funds & Transaction Records)
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE RESTRICT,
  amount NUMERIC(14,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL,
  transaction_reference VARCHAR(100) UNIQUE NOT NULL,
  status payment_status NOT NULL DEFAULT 'completed',
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Company Expenses (Operational Expenditures & Division Budgets)
CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL,
  category VARCHAR(50) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'USD',
  vendor VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  incurred_date DATE NOT NULL,
  receipt_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT
);

-- ------------------------------------------------------------------------------
-- 7. DIVISION SPECIFIC EXTENSIONS
-- ------------------------------------------------------------------------------

-- Gaming Marketplace: Digital Products & FiveM Scripts
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  product_type VARCHAR(50) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  download_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Gaming Marketplace: Customer Orders
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Marketing & Growth Campaigns
CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
  name TEXT NOT NULL,
  channel VARCHAR(50) NOT NULL,
  budget NUMERIC(12,2) NOT NULL,
  spend NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  conversions INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE
);

-- Media House Projects (Shoot Dates & Video Production Stages)
CREATE TABLE IF NOT EXISTS public.media_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE RESTRICT,
  shoot_date DATE,
  deliverable_format VARCHAR(50) NOT NULL,
  production_stage VARCHAR(50) NOT NULL,
  assets_drive_url TEXT
);

-- Gaming & Esports Tournaments
CREATE TABLE IF NOT EXISTS public.esports_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  game_title VARCHAR(100) NOT NULL,
  prize_pool NUMERIC(12,2) NOT NULL,
  format VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  participants_count INT NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'upcoming'
);

-- ------------------------------------------------------------------------------
-- 8. SYSTEM AUDIT LOGS & NOTIFICATIONS
-- ------------------------------------------------------------------------------

-- Activity Logs (Immutable Audit Trail)
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Realtime Notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  type VARCHAR(30) NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ------------------------------------------------------------------------------
-- 9. PERFORMANCE INDEXES
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_division ON public.profiles(primary_division_id);
CREATE INDEX IF NOT EXISTS idx_user_divisions_user ON public.user_divisions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_divisions_div ON public.user_divisions(division_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_div ON public.team_members(division_id);
CREATE INDEX IF NOT EXISTS idx_services_division ON public.services(division_id);
CREATE INDEX IF NOT EXISTS idx_clients_division ON public.clients(primary_division_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON public.clients(status);
CREATE INDEX IF NOT EXISTS idx_leads_division ON public.leads(division_id);
CREATE INDEX IF NOT EXISTS idx_leads_assigned ON public.leads(assigned_to);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_deals_client ON public.deals(client_id);
CREATE INDEX IF NOT EXISTS idx_deals_division ON public.deals(division_id);
CREATE INDEX IF NOT EXISTS idx_deals_assigned ON public.deals(assigned_to);
CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
CREATE INDEX IF NOT EXISTS idx_projects_client ON public.projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_division ON public.projects(division_id);
CREATE INDEX IF NOT EXISTS idx_projects_pm ON public.projects(project_manager_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project ON public.tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_division ON public.tasks(division_id);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_invoices_client ON public.invoices(client_id);
CREATE INDEX IF NOT EXISTS idx_invoices_division ON public.invoices(division_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_payments_invoice ON public.payments(invoice_id);
CREATE INDEX IF NOT EXISTS idx_payments_client ON public.payments(client_id);
CREATE INDEX IF NOT EXISTS idx_expenses_division ON public.expenses(division_id);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON public.expenses(created_by);
CREATE INDEX IF NOT EXISTS idx_products_division ON public.products(division_id);
CREATE INDEX IF NOT EXISTS idx_orders_product ON public.orders(product_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_client ON public.campaigns(client_id);
CREATE INDEX IF NOT EXISTS idx_campaigns_division ON public.campaigns(division_id);
CREATE INDEX IF NOT EXISTS idx_media_projects_project ON public.media_projects(project_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);

-- ------------------------------------------------------------------------------
-- 10. REUSABLE TIMESTAMPS & AUTOMATION TRIGGERS
-- ------------------------------------------------------------------------------

-- Generic updated_at timestamp trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_team_members_updated_at ON public.team_members;
CREATE TRIGGER trg_team_members_updated_at BEFORE UPDATE ON public.team_members
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
CREATE TRIGGER trg_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_deals_updated_at ON public.deals;
CREATE TRIGGER trg_deals_updated_at BEFORE UPDATE ON public.deals
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
CREATE TRIGGER trg_projects_updated_at BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
CREATE TRIGGER trg_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 11. HARDENED SECURITY HELPER FUNCTIONS
-- ------------------------------------------------------------------------------

-- Helper: Check if current authenticated user is active Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'super_admin'
      AND is_active = true
  );
END;
$$;

-- Helper: Check if user belongs to Finance or is Super Admin
CREATE OR REPLACE FUNCTION public.is_finance_personnel()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND (role IN ('super_admin', 'finance_manager'))
      AND is_active = true
  );
END;
$$;

-- Helper: Check if user has access to a specific division
CREATE OR REPLACE FUNCTION public.has_division_access(target_division_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- Super Admins have universal cross-division access
  IF public.is_super_admin() THEN
    RETURN true;
  END IF;

  -- Check primary division or secondary division memberships
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid()
      AND is_active = true
      AND primary_division_id = target_division_id
  ) OR EXISTS (
    SELECT 1 FROM public.user_divisions
    WHERE user_id = auth.uid()
      AND division_id = target_division_id
  ) OR EXISTS (
    SELECT 1 FROM public.team_members
    WHERE user_id = auth.uid()
      AND division_id = target_division_id
      AND status = 'active'
  );
END;
$$;

-- Restrict function execution to authenticated users and service_role
REVOKE EXECUTE ON FUNCTION public.is_super_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_super_admin() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_finance_personnel() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_finance_personnel() TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.has_division_access(UUID) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.has_division_access(UUID) TO authenticated, service_role;

-- ------------------------------------------------------------------------------
-- 12. PRIVILEGE ESCALATION PREVENTION TRIGGER
-- ------------------------------------------------------------------------------

-- Prevent users from self-assigning super_admin or modifying active status
CREATE OR REPLACE FUNCTION public.protect_profile_privileged_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  -- If role or is_active is modified, caller must be a super_admin
  IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.is_active IS DISTINCT FROM OLD.is_active) THEN
    IF NOT public.is_super_admin() THEN
      RAISE EXCEPTION 'SECURITY VIOLATION: Only Super Admins can alter role or active account status.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_privileged_fields ON public.profiles;
CREATE TRIGGER trg_protect_profile_privileged_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_privileged_fields();

-- ------------------------------------------------------------------------------
-- 13. AUTOMATIC PROFILE CREATION TRIGGER (FROM auth.users)
-- ------------------------------------------------------------------------------

-- Trigger function executed when a new user signs up or is invited
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    job_title,
    role,
    is_active
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'job_title', 'Staff Member'),
    'team_member', -- Default non-privileged role
    true
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 14. ROW LEVEL SECURITY (RLS) ACTIVATION
-- ------------------------------------------------------------------------------
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.esports_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ------------------------------------------------------------------------------
-- 15. GRANULAR RLS POLICIES
-- ------------------------------------------------------------------------------

-- Divisions & Roles: Readable by all authenticated internal staff; manageable by Super Admin
DROP POLICY IF EXISTS "Divisions readable by authenticated staff" ON public.divisions;
CREATE POLICY "Divisions readable by authenticated staff" ON public.divisions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Divisions manageable by super admin" ON public.divisions;
CREATE POLICY "Divisions manageable by super admin" ON public.divisions
  FOR ALL TO authenticated USING (public.is_super_admin());

DROP POLICY IF EXISTS "Roles readable by authenticated staff" ON public.roles;
CREATE POLICY "Roles readable by authenticated staff" ON public.roles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Roles manageable by super admin" ON public.roles;
CREATE POLICY "Roles manageable by super admin" ON public.roles
  FOR ALL TO authenticated USING (public.is_super_admin());

-- User Profiles
DROP POLICY IF EXISTS "Profiles viewable by authenticated staff" ON public.profiles;
CREATE POLICY "Profiles viewable by authenticated staff" ON public.profiles
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Users can update own non-privileged profile fields" ON public.profiles;
CREATE POLICY "Users can update own non-privileged profile fields" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "Super Admins manage all profiles" ON public.profiles;
CREATE POLICY "Super Admins manage all profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.is_super_admin());

-- User Divisions & Team Members
DROP POLICY IF EXISTS "Team memberships viewable by authenticated staff" ON public.user_divisions;
CREATE POLICY "Team memberships viewable by authenticated staff" ON public.user_divisions
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Team memberships manageable by super admin" ON public.user_divisions;
CREATE POLICY "Team memberships manageable by super admin" ON public.user_divisions
  FOR ALL TO authenticated USING (public.is_super_admin());

DROP POLICY IF EXISTS "Team roster viewable by authenticated staff" ON public.team_members;
CREATE POLICY "Team roster viewable by authenticated staff" ON public.team_members
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Team roster manageable by super admin" ON public.team_members;
CREATE POLICY "Team roster manageable by super admin" ON public.team_members
  FOR ALL TO authenticated USING (public.is_super_admin());

-- Services Catalog
DROP POLICY IF EXISTS "Services readable by authenticated staff" ON public.services;
CREATE POLICY "Services readable by authenticated staff" ON public.services
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Services manageable by super admin or division head" ON public.services;
CREATE POLICY "Services manageable by super admin or division head" ON public.services
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_division_access(division_id));

-- Corporate Clients
DROP POLICY IF EXISTS "Clients viewable by authenticated staff" ON public.clients;
CREATE POLICY "Clients viewable by authenticated staff" ON public.clients
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Clients manageable by authorized division staff" ON public.clients;
CREATE POLICY "Clients manageable by authorized division staff" ON public.clients
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_division_access(primary_division_id));

-- Leads
DROP POLICY IF EXISTS "Leads viewable by division staff or assignees" ON public.leads;
CREATE POLICY "Leads viewable by division staff or assignees" ON public.leads
  FOR SELECT TO authenticated
  USING (public.has_division_access(division_id) OR assigned_to = auth.uid());

DROP POLICY IF EXISTS "Leads insertable by authenticated staff" ON public.leads;
CREATE POLICY "Leads insertable by authenticated staff" ON public.leads
  FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Leads updateable by division staff or assignees" ON public.leads;
CREATE POLICY "Leads updateable by division staff or assignees" ON public.leads
  FOR UPDATE TO authenticated
  USING (public.has_division_access(division_id) OR assigned_to = auth.uid());

DROP POLICY IF EXISTS "Leads deletable by super admin only" ON public.leads;
CREATE POLICY "Leads deletable by super admin only" ON public.leads
  FOR DELETE TO authenticated USING (public.is_super_admin());

-- Deals & Sales Pipeline
DROP POLICY IF EXISTS "Deals viewable by division staff or assignees" ON public.deals;
CREATE POLICY "Deals viewable by division staff or assignees" ON public.deals
  FOR SELECT TO authenticated
  USING (public.has_division_access(division_id) OR assigned_to = auth.uid());

DROP POLICY IF EXISTS "Deals manageable by division staff or assignees" ON public.deals;
CREATE POLICY "Deals manageable by division staff or assignees" ON public.deals
  FOR ALL TO authenticated
  USING (public.has_division_access(division_id) OR assigned_to = auth.uid());

-- Projects & Tasks
DROP POLICY IF EXISTS "Projects viewable by division staff or assignees" ON public.projects;
CREATE POLICY "Projects viewable by division staff or assignees" ON public.projects
  FOR SELECT TO authenticated
  USING (public.has_division_access(division_id) OR project_manager_id = auth.uid());

DROP POLICY IF EXISTS "Projects manageable by division staff" ON public.projects;
CREATE POLICY "Projects manageable by division staff" ON public.projects
  FOR ALL TO authenticated
  USING (public.has_division_access(division_id));

DROP POLICY IF EXISTS "Tasks viewable by project division staff or assignees" ON public.tasks;
CREATE POLICY "Tasks viewable by project division staff or assignees" ON public.tasks
  FOR SELECT TO authenticated
  USING (public.has_division_access(division_id) OR assigned_to = auth.uid());

DROP POLICY IF EXISTS "Tasks manageable by division staff or assignees" ON public.tasks;
CREATE POLICY "Tasks manageable by division staff or assignees" ON public.tasks
  FOR ALL TO authenticated
  USING (public.has_division_access(division_id) OR assigned_to = auth.uid());

-- Invoices & Payments (Restricted to Finance & Super Admin)
DROP POLICY IF EXISTS "Invoices viewable by finance personnel or project division" ON public.invoices;
CREATE POLICY "Invoices viewable by finance personnel or project division" ON public.invoices
  FOR SELECT TO authenticated
  USING (public.is_finance_personnel() OR public.has_division_access(division_id));

DROP POLICY IF EXISTS "Invoices manageable by finance personnel only" ON public.invoices;
CREATE POLICY "Invoices manageable by finance personnel only" ON public.invoices
  FOR ALL TO authenticated
  USING (public.is_finance_personnel());

DROP POLICY IF EXISTS "Payments viewable by finance personnel" ON public.payments;
CREATE POLICY "Payments viewable by finance personnel" ON public.payments
  FOR SELECT TO authenticated
  USING (public.is_finance_personnel());

DROP POLICY IF EXISTS "Payments manageable by finance personnel only" ON public.payments;
CREATE POLICY "Payments manageable by finance personnel only" ON public.payments
  FOR ALL TO authenticated
  USING (public.is_finance_personnel());

DROP POLICY IF EXISTS "Expenses viewable by creator or finance personnel" ON public.expenses;
CREATE POLICY "Expenses viewable by creator or finance personnel" ON public.expenses
  FOR SELECT TO authenticated
  USING (created_by = auth.uid() OR public.is_finance_personnel());

DROP POLICY IF EXISTS "Expenses insertable by authenticated staff" ON public.expenses;
CREATE POLICY "Expenses insertable by authenticated staff" ON public.expenses
  FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

DROP POLICY IF EXISTS "Expenses manageable by finance personnel" ON public.expenses;
CREATE POLICY "Expenses manageable by finance personnel" ON public.expenses
  FOR ALL TO authenticated
  USING (public.is_finance_personnel());

-- Products & Orders (Gaming Marketplace)
DROP POLICY IF EXISTS "Products viewable by authenticated staff" ON public.products;
CREATE POLICY "Products viewable by authenticated staff" ON public.products
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Products manageable by marketplace division staff" ON public.products;
CREATE POLICY "Products manageable by marketplace division staff" ON public.products
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR public.has_division_access(division_id));

DROP POLICY IF EXISTS "Orders viewable by marketplace staff or finance" ON public.orders;
CREATE POLICY "Orders viewable by marketplace staff or finance" ON public.orders
  FOR SELECT TO authenticated
  USING (public.is_finance_personnel() OR public.is_super_admin());

DROP POLICY IF EXISTS "Orders manageable by super admin" ON public.orders;
CREATE POLICY "Orders manageable by super admin" ON public.orders
  FOR ALL TO authenticated USING (public.is_super_admin());

-- Marketing Campaigns
DROP POLICY IF EXISTS "Campaigns viewable by division staff" ON public.campaigns;
CREATE POLICY "Campaigns viewable by division staff" ON public.campaigns
  FOR SELECT TO authenticated
  USING (public.has_division_access(division_id));

DROP POLICY IF EXISTS "Campaigns manageable by division staff" ON public.campaigns;
CREATE POLICY "Campaigns manageable by division staff" ON public.campaigns
  FOR ALL TO authenticated
  USING (public.has_division_access(division_id));

-- Media Projects
DROP POLICY IF EXISTS "Media projects viewable by media division staff" ON public.media_projects;
CREATE POLICY "Media projects viewable by media division staff" ON public.media_projects
  FOR SELECT TO authenticated
  USING (public.has_division_access(division_id));

DROP POLICY IF EXISTS "Media projects manageable by media division staff" ON public.media_projects;
CREATE POLICY "Media projects manageable by media division staff" ON public.media_projects
  FOR ALL TO authenticated
  USING (public.has_division_access(division_id));

-- Esports Events
DROP POLICY IF EXISTS "Esports events viewable by authenticated staff" ON public.esports_events;
CREATE POLICY "Esports events viewable by authenticated staff" ON public.esports_events
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Esports events manageable by esports division staff" ON public.esports_events;
CREATE POLICY "Esports events manageable by esports division staff" ON public.esports_events
  FOR ALL TO authenticated
  USING (public.is_super_admin() OR EXISTS (
    SELECT 1 FROM public.divisions d
    WHERE d.slug = 'gaming-esports' AND public.has_division_access(d.id)
  ));

-- Activity Logs (Immutable Audit Trail)
DROP POLICY IF EXISTS "Activity logs viewable by authenticated staff" ON public.activity_logs;
CREATE POLICY "Activity logs viewable by authenticated staff" ON public.activity_logs
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Activity logs insertable by creator" ON public.activity_logs;
CREATE POLICY "Activity logs insertable by creator" ON public.activity_logs
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Notifications (Owner Isolation)
DROP POLICY IF EXISTS "Notifications strictly viewable by owner" ON public.notifications;
CREATE POLICY "Notifications strictly viewable by owner" ON public.notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Notifications manageable by owner" ON public.notifications;
CREATE POLICY "Notifications manageable by owner" ON public.notifications
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- ==============================================================================
-- AURTWIZ BUSINESS OS - COMPLETE POSTGRESQL / SUPABASE DATABASE SCHEMA (BACKUP)
-- ==============================================================================
-- COMPANY: Aurtwiz Technologies
-- ARCHITECTURE: Single-Company Internal Business OS
-- STAGE: Original Step 1 / Initial Version Backup
-- ==============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- ENUMS
-- ==============================================================================

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
  CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'in_review', 'done', 'blocked');
  CREATE TYPE invoice_status AS ENUM ('draft', 'issued', 'paid', 'overdue', 'cancelled');
  CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'refunded');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- ==============================================================================
-- 1. DIVISIONS (The 7 Core Business Divisions of Aurtwiz Technologies)
-- ==============================================================================
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

-- ==============================================================================
-- 2. USER PROFILES (Linked to auth.users in Supabase)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  job_title TEXT NOT NULL,
  role system_role NOT NULL DEFAULT 'team_member',
  primary_division_id UUID REFERENCES public.divisions(id) ON DELETE SET NULL,
  phone TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 3. SERVICES (Catalog across all divisions)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  division_id UUID NOT NULL REFERENCES public.divisions(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  base_price NUMERIC(12,2),
  currency VARCHAR(3) DEFAULT 'USD',
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 4. CLIENTS & LEADS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.clients (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_name TEXT NOT NULL,
  contact_person TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  industry TEXT,
  status VARCHAR(20) DEFAULT 'active',
  total_revenue NUMERIC(14,2) DEFAULT 0,
  primary_division_id UUID NOT NULL REFERENCES public.divisions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  division_id UUID NOT NULL REFERENCES public.divisions(id),
  service_interest_id UUID REFERENCES public.services(id),
  source VARCHAR(50) DEFAULT 'website',
  status lead_status NOT NULL DEFAULT 'new',
  assigned_to UUID REFERENCES public.profiles(id),
  estimated_value NUMERIC(12,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 5. DEALS & SALES PIPELINE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id),
  stage deal_stage NOT NULL DEFAULT 'discovery',
  value NUMERIC(14,2) NOT NULL DEFAULT 0,
  expected_close_date DATE,
  assigned_to UUID REFERENCES public.profiles(id),
  probability INT DEFAULT 20,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 6. PROJECTS & TASKS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(20) UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  division_id UUID NOT NULL REFERENCES public.divisions(id),
  status project_status NOT NULL DEFAULT 'planning',
  start_date DATE,
  target_completion_date DATE,
  budget NUMERIC(14,2),
  project_manager_id UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id),
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  assigned_to UUID REFERENCES public.profiles(id),
  due_date DATE,
  estimated_hours NUMERIC(6,2),
  actual_hours NUMERIC(6,2) DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- 7. FINANCE (Invoices, Payments, Expenses)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  client_id UUID NOT NULL REFERENCES public.clients(id),
  project_id UUID REFERENCES public.projects(id),
  division_id UUID NOT NULL REFERENCES public.divisions(id),
  subtotal NUMERIC(14,2) NOT NULL,
  tax NUMERIC(14,2) DEFAULT 0,
  total_amount NUMERIC(14,2) NOT NULL,
  status invoice_status NOT NULL DEFAULT 'draft',
  issue_date DATE NOT NULL,
  due_date DATE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID REFERENCES public.invoices(id),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  amount NUMERIC(14,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  payment_method VARCHAR(50) NOT NULL,
  transaction_reference VARCHAR(100) UNIQUE NOT NULL,
  status payment_status NOT NULL DEFAULT 'completed',
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  division_id UUID REFERENCES public.divisions(id),
  category VARCHAR(50) NOT NULL,
  amount NUMERIC(12,2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  vendor VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  incurred_date DATE NOT NULL,
  receipt_url TEXT,
  created_by UUID NOT NULL REFERENCES public.profiles(id)
);

-- ==============================================================================
-- 8. DIVISION SPECIFIC EXTENSIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  division_id UUID NOT NULL REFERENCES public.divisions(id),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL,
  product_type VARCHAR(50) NOT NULL, -- 'fivem_script', 'digital_asset', etc.
  is_active BOOLEAN DEFAULT true,
  download_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number VARCHAR(50) UNIQUE NOT NULL,
  product_id UUID NOT NULL REFERENCES public.products(id),
  customer_email TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  amount_paid NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  division_id UUID NOT NULL REFERENCES public.divisions(id),
  name TEXT NOT NULL,
  channel VARCHAR(50) NOT NULL,
  budget NUMERIC(12,2) NOT NULL,
  spend NUMERIC(12,2) DEFAULT 0,
  conversions INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'active',
  start_date DATE NOT NULL,
  end_date DATE
);

CREATE TABLE IF NOT EXISTS public.media_projects (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  division_id UUID NOT NULL REFERENCES public.divisions(id),
  shoot_date DATE,
  deliverable_format VARCHAR(50) NOT NULL,
  production_stage VARCHAR(50) NOT NULL,
  assets_drive_url TEXT
);

CREATE TABLE IF NOT EXISTS public.esports_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  game_title VARCHAR(100) NOT NULL,
  prize_pool NUMERIC(12,2) NOT NULL,
  format VARCHAR(20) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  participants_count INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'upcoming'
);

-- ==============================================================================
-- 9. AUDIT LOGS & NOTIFICATIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES public.profiles(id),
  action TEXT NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  division_id UUID REFERENCES public.divisions(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  type VARCHAR(30) DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function: check if current user is Super Admin
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'super_admin' AND is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Authenticated users can read team profiles; users can update own profile; Super Admin manages all
CREATE POLICY "Profiles viewable by internal team" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (id = auth.uid());

CREATE POLICY "Super Admins manage all profiles" ON public.profiles
  FOR ALL TO authenticated USING (public.is_super_admin());

-- Divisions & Services: Read-only for all company staff; writable by Super Admin
CREATE POLICY "Divisions readable by internal team" ON public.divisions
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Services readable by internal team" ON public.services
  FOR SELECT TO authenticated USING (true);

-- Notifications: Only visible to owner
CREATE POLICY "Users view own notifications" ON public.notifications
  FOR ALL TO authenticated USING (user_id = auth.uid());

-- Activity Logs: Read-only for authenticated team members
CREATE POLICY "Team view activity logs" ON public.activity_logs
  FOR SELECT TO authenticated USING (true);

-- ==============================================================================
-- AURTWIZ BUSINESS OS — DATABASE ROLLBACK SCRIPT
-- ==============================================================================
-- COMPANY: Aurtwiz Technologies
-- ARCHITECTURE: Single-Company Internal Business OS
-- WARNING: This script tears down the Aurtwiz Business OS public schema.
--          Executing this will DROP all 21 application tables, functions,
--          triggers, and custom enum types.
-- ==============================================================================

-- 1. DROP TRIGGERS ON AUTH.USERS & PUBLIC TABLES
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS trg_protect_profile_privileged_fields ON public.profiles;
DROP TRIGGER IF EXISTS trg_tasks_updated_at ON public.tasks;
DROP TRIGGER IF EXISTS trg_projects_updated_at ON public.projects;
DROP TRIGGER IF EXISTS trg_deals_updated_at ON public.deals;
DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
DROP TRIGGER IF EXISTS trg_clients_updated_at ON public.clients;
DROP TRIGGER IF EXISTS trg_team_members_updated_at ON public.team_members;
DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;

-- 2. DROP FUNCTIONS
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.protect_profile_privileged_fields() CASCADE;
DROP FUNCTION IF EXISTS public.has_division_access(UUID) CASCADE;
DROP FUNCTION IF EXISTS public.is_finance_personnel() CASCADE;
DROP FUNCTION IF EXISTS public.is_super_admin() CASCADE;
DROP FUNCTION IF EXISTS public.handle_updated_at() CASCADE;

-- 3. DROP ALL 21 PUBLIC APPLICATION TABLES (Reverse Dependency Order)
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.activity_logs CASCADE;
DROP TABLE IF EXISTS public.esports_events CASCADE;
DROP TABLE IF EXISTS public.media_projects CASCADE;
DROP TABLE IF EXISTS public.campaigns CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.deals CASCADE;
DROP TABLE IF EXISTS public.leads CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.services CASCADE;
DROP TABLE IF EXISTS public.team_members CASCADE;
DROP TABLE IF EXISTS public.user_divisions CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;
DROP TABLE IF EXISTS public.roles CASCADE;
DROP TABLE IF EXISTS public.divisions CASCADE;

-- 4. DROP CUSTOM ENUM TYPES
DROP TYPE IF EXISTS public.payment_status CASCADE;
DROP TYPE IF EXISTS public.invoice_status CASCADE;
DROP TYPE IF EXISTS public.task_status CASCADE;
DROP TYPE IF EXISTS public.task_priority CASCADE;
DROP TYPE IF EXISTS public.project_status CASCADE;
DROP TYPE IF EXISTS public.deal_stage CASCADE;
DROP TYPE IF EXISTS public.lead_status CASCADE;
DROP TYPE IF EXISTS public.system_role CASCADE;

-- ROLLBACK COMPLETE

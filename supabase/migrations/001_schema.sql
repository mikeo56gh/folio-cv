-- ================================================================
-- FOLIO CV BUILDER — DATABASE SCHEMA
-- Run this in Supabase SQL editor: https://supabase.com/dashboard/project/_/sql
-- ================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ────────────────────────────────────────────────────────────────
-- USERS — extends Supabase auth.users
-- ────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  plan          text not null default 'free',   -- free | pro | boost | recruiter
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',  -- active | inactive | past_due | cancelled
  usage         jsonb not null default '{}',    -- {cv_generations: 2, cover_letters: 1, ...}
  usage_reset_at timestamptz default now(),     -- reset monthly
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- Auto-create user record on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ────────────────────────────────────────────────────────────────
-- PROFILES — CV profiles (multi-profile support)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  name          text not null default 'Default',
  is_default    boolean default false,
  profile_data  jsonb not null default '{}',   -- {profile, jobs, education, qualifications, skills}
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

create index if not exists profiles_user_id_idx on public.profiles(user_id);

-- Auto-create default profile on user creation
create or replace function public.handle_new_profile()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (user_id, name, is_default)
  values (new.id, 'Default', true);
  return new;
end;
$$;

drop trigger if exists on_user_created_profile on public.users;
create trigger on_user_created_profile
  after insert on public.users
  for each row execute procedure public.handle_new_profile();

-- ────────────────────────────────────────────────────────────────
-- CV VERSIONS — saved generated outputs
-- ────────────────────────────────────────────────────────────────
create table if not exists public.cv_versions (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  profile_id    uuid references public.profiles(id) on delete set null,
  name          text not null,
  cv_text       text,
  cover_letter  text,
  jd_snippet    text,          -- first 500 chars of JD for reference
  company_name  text,
  role_title    text,
  fit_score     integer,
  created_at    timestamptz default now()
);

create index if not exists cv_versions_user_id_idx on public.cv_versions(user_id);

-- ────────────────────────────────────────────────────────────────
-- APPLICATION TRACKER
-- ────────────────────────────────────────────────────────────────
create table if not exists public.applications (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  role_title    text not null,
  company       text not null,
  job_url       text,
  status        text not null default 'applied',  -- applied | interview | offer | rejected
  cv_version_id uuid references public.cv_versions(id) on delete set null,
  salary_min    integer,
  salary_max    integer,
  notes         text,
  applied_at    timestamptz default now(),
  updated_at    timestamptz default now(),
  created_at    timestamptz default now()
);

create index if not exists applications_user_id_idx on public.applications(user_id);
create index if not exists applications_status_idx on public.applications(status);

-- ────────────────────────────────────────────────────────────────
-- JOB ALERTS — weekly email matches
-- ────────────────────────────────────────────────────────────────
create table if not exists public.job_alerts (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid not null references public.users(id) on delete cascade,
  title         text not null,        -- e.g. "Senior Engineer alerts"
  keywords      text[],
  location      text,
  salary_min    integer,
  sector        text,
  seniority     text,
  is_active     boolean default true,
  last_sent_at  timestamptz,
  created_at    timestamptz default now()
);

-- ────────────────────────────────────────────────────────────────
-- USAGE ANALYTICS (anonymised, for your dashboard)
-- ────────────────────────────────────────────────────────────────
create table if not exists public.usage_events (
  id            uuid primary key default uuid_generate_v4(),
  user_id       uuid references public.users(id) on delete set null,
  event         text not null,        -- cv_generated | cover_letter | fit_review | etc.
  plan          text,
  metadata      jsonb default '{}',
  created_at    timestamptz default now()
);

create index if not exists usage_events_event_idx on public.usage_events(event);
create index if not exists usage_events_created_at_idx on public.usage_events(created_at);

-- ────────────────────────────────────────────────────────────────
-- ROW LEVEL SECURITY — users only see their own data
-- ────────────────────────────────────────────────────────────────
alter table public.users enable row level security;
alter table public.profiles enable row level security;
alter table public.cv_versions enable row level security;
alter table public.applications enable row level security;
alter table public.job_alerts enable row level security;

create policy "Users can view own record" on public.users
  for select using (auth.uid() = id);
create policy "Users can update own record" on public.users
  for update using (auth.uid() = id);

create policy "Users can CRUD own profiles" on public.profiles
  for all using (auth.uid() = user_id);

create policy "Users can CRUD own CV versions" on public.cv_versions
  for all using (auth.uid() = user_id);

create policy "Users can CRUD own applications" on public.applications
  for all using (auth.uid() = user_id);

create policy "Users can CRUD own alerts" on public.job_alerts
  for all using (auth.uid() = user_id);

-- ────────────────────────────────────────────────────────────────
-- MONTHLY USAGE RESET FUNCTION
-- Schedule with pg_cron: select cron.schedule('0 0 1 * *', $$select reset_monthly_usage()$$);
-- ────────────────────────────────────────────────────────────────
create or replace function public.reset_monthly_usage()
returns void language plpgsql security definer as $$
begin
  update public.users
  set usage = '{}', usage_reset_at = now()
  where usage_reset_at < now() - interval '1 month';
end;
$$;

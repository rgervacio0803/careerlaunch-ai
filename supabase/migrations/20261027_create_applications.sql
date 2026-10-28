-- Saved applications: one row per resume + job description a user works on.
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

create table if not exists public.applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  job_title text not null default '',
  company_name text not null default '',
  ats_score integer,
  current_step integer not null default 1,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists applications_user_updated_idx
  on public.applications (user_id, updated_at desc);

-- Keep updated_at current on every change.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists applications_set_updated_at on public.applications;
create trigger applications_set_updated_at
  before update on public.applications
  for each row execute function public.set_updated_at();

-- Each user can only see and change their own applications.
alter table public.applications enable row level security;

drop policy if exists "Users can view their own applications" on public.applications;
create policy "Users can view their own applications"
  on public.applications for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can add their own applications" on public.applications;
create policy "Users can add their own applications"
  on public.applications for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own applications" on public.applications;
create policy "Users can update their own applications"
  on public.applications for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own applications" on public.applications;
create policy "Users can delete their own applications"
  on public.applications for delete to authenticated
  using ((select auth.uid()) = user_id);

grant select, insert, update, delete on public.applications to authenticated;

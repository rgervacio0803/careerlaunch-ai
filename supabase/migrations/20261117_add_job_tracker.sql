-- Job tracker: status, date applied, posting link and notes for each
-- application. Safe to run more than once.
-- Run this once in Supabase: SQL Editor -> New query -> paste -> Run.

alter table public.applications
  add column if not exists status text not null default 'saved',
  add column if not exists applied_on date,
  add column if not exists job_url text not null default '',
  add column if not exists notes text not null default '';

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'applications_status_check'
  ) then
    alter table public.applications
      add constraint applications_status_check
      check (status in ('saved', 'applied', 'interviewing', 'offer', 'rejected'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'applications_tracker_lengths_check'
  ) then
    alter table public.applications
      add constraint applications_tracker_lengths_check
      check (char_length(job_url) <= 2000 and char_length(notes) <= 5000);
  end if;
end;
$$;

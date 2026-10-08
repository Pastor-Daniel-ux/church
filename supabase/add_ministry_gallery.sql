-- Add the ministry photo gallery to an existing Supabase database.
-- Existing ministry rows and user data are preserved.
alter table public.ministries
  add column if not exists gallery_urls text[] not null default '{}'::text[];

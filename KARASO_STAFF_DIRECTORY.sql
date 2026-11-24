-- KARASO ROLEPLAY: staff directory
-- Run once in Supabase Dashboard > SQL Editor.
create table if not exists public.karaso_staff_members (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  rank_number integer not null,
  role_name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists karaso_staff_members_rank_idx
  on public.karaso_staff_members(rank_number desc, created_at asc);
alter table public.karaso_staff_members enable row level security;
drop policy if exists "Staff directory is publicly readable" on public.karaso_staff_members;
create policy "Staff directory is publicly readable"
  on public.karaso_staff_members for select using (true);
drop policy if exists "Owners can insert staff members" on public.karaso_staff_members;
create policy "Owners can insert staff members"
  on public.karaso_staff_members for insert to authenticated
  with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role='owner'));
drop policy if exists "Owners can update staff members" on public.karaso_staff_members;
create policy "Owners can update staff members"
  on public.karaso_staff_members for update to authenticated
  using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role='owner'))
  with check (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role='owner'));
drop policy if exists "Owners can delete staff members" on public.karaso_staff_members;
create policy "Owners can delete staff members"
  on public.karaso_staff_members for delete to authenticated
  using (exists (select 1 from public.profiles p where p.id=auth.uid() and p.role='owner'));
create or replace function public.karaso_staff_members_set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
drop trigger if exists karaso_staff_members_updated_at on public.karaso_staff_members;
create trigger karaso_staff_members_updated_at before update on public.karaso_staff_members
for each row execute function public.karaso_staff_members_set_updated_at();

-- Run this SQL once in the Supabase SQL Editor for Karaso.
create table if not exists public.karaso_staff_commands (
  id uuid primary key default gen_random_uuid(),
  command_category text not null check (command_category in ('admin','helper')),
  rank_name text not null,
  command_name text not null,
  usage_text text,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists karaso_staff_commands_rank_idx on public.karaso_staff_commands(rank_name);

alter table public.karaso_staff_commands enable row level security;

-- Anyone can read custom commands so the public staff-command page can show them.
drop policy if exists "Staff commands are publicly readable" on public.karaso_staff_commands;
create policy "Staff commands are publicly readable"
on public.karaso_staff_commands for select
using (true);

-- Only users whose profiles.role is exactly 'owner' may insert/edit/delete.
drop policy if exists "Owners can insert staff commands" on public.karaso_staff_commands;
create policy "Owners can insert staff commands"
on public.karaso_staff_commands for insert to authenticated
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

drop policy if exists "Owners can update staff commands" on public.karaso_staff_commands;
create policy "Owners can update staff commands"
on public.karaso_staff_commands for update to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));

drop policy if exists "Owners can delete staff commands" on public.karaso_staff_commands;
create policy "Owners can delete staff commands"
on public.karaso_staff_commands for delete to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'owner'));


create or replace function public.karaso_staff_commands_set_updated_at()
returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
drop trigger if exists karaso_staff_commands_updated_at on public.karaso_staff_commands;
create trigger karaso_staff_commands_updated_at before update on public.karaso_staff_commands
for each row execute function public.karaso_staff_commands_set_updated_at();

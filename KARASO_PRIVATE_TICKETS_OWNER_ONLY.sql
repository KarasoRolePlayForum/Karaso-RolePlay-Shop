-- KARASO ROLEPLAY: private support tickets, visible only to ticket owner and Owner role.
-- Run once in Supabase SQL Editor. Does not grant Owner/Admin role to anyone.

create table if not exists public.support_tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  message text not null,
  status text not null default 'open',
  owner_reply text,
  replied_by uuid references auth.users(id) on delete set null,
  replied_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.support_tickets add column if not exists owner_reply text;
alter table public.support_tickets add column if not exists replied_by uuid references auth.users(id) on delete set null;
alter table public.support_tickets add column if not exists replied_at timestamptz;
alter table public.support_tickets add column if not exists updated_at timestamptz not null default now();
alter table public.support_tickets add column if not exists status text not null default 'open';

create or replace function public.karaso_is_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'owner'
  );
$$;
revoke all on function public.karaso_is_owner() from public;
grant execute on function public.karaso_is_owner() to authenticated;

alter table public.support_tickets enable row level security;

-- Remove any older policies on this table so an old broad policy cannot expose private tickets.
do $$
declare pol record;
begin
  for pol in
    select policyname from pg_policies
    where schemaname = 'public' and tablename = 'support_tickets'
  loop
    execute format('drop policy if exists %I on public.support_tickets', pol.policyname);
  end loop;
end $$;

create policy "ticket_owner_or_creator_can_read"
on public.support_tickets for select to authenticated
using (user_id = auth.uid() or public.karaso_is_owner());

create policy "users_create_own_ticket"
on public.support_tickets for insert to authenticated
with check (user_id = auth.uid());

create policy "only_owner_can_update_tickets"
on public.support_tickets for update to authenticated
using (public.karaso_is_owner())
with check (public.karaso_is_owner());

revoke all on table public.support_tickets from anon;
grant select, insert on table public.support_tickets to authenticated;
revoke update on table public.support_tickets from authenticated;
grant update (owner_reply, status, replied_by, replied_at, updated_at)
on table public.support_tickets to authenticated;


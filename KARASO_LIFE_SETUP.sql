-- KARASO LIFE setup. Run once in Supabase SQL Editor.
create table if not exists public.karaso_life_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null,
 title text,
 position text,
 affiliation text,
 bio text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now()
);
alter table public.karaso_life_profiles enable row level security;
drop policy if exists "LIFE profiles are public" on public.karaso_life_profiles;
create policy "LIFE profiles are public" on public.karaso_life_profiles for select using (true);
drop policy if exists "Users insert own LIFE profile" on public.karaso_life_profiles;
create policy "Users insert own LIFE profile" on public.karaso_life_profiles for insert to authenticated with check (user_id=auth.uid());
drop policy if exists "Users update own LIFE profile" on public.karaso_life_profiles;
create policy "Users update own LIFE profile" on public.karaso_life_profiles for update to authenticated using (user_id=auth.uid()) with check (user_id=auth.uid());
create table if not exists public.karaso_life_groups (
 id uuid primary key default gen_random_uuid(),
 name text not null,
 group_type text not null default 'crew' check (group_type in ('crew','organization','club','alliance','other')),
 description text,
 leader_id uuid not null references auth.users(id) on delete cascade,
 created_by uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now()
);
alter table public.karaso_life_groups enable row level security;
drop policy if exists "LIFE groups are public" on public.karaso_life_groups;
create policy "LIFE groups are public" on public.karaso_life_groups for select using (true);
drop policy if exists "Authenticated create LIFE groups" on public.karaso_life_groups;
create policy "Authenticated create LIFE groups" on public.karaso_life_groups for insert to authenticated with check (created_by=auth.uid() and leader_id=auth.uid());
drop policy if exists "Creator update LIFE groups" on public.karaso_life_groups;
create policy "Creator update LIFE groups" on public.karaso_life_groups for update to authenticated using (created_by=auth.uid()) with check (created_by=auth.uid());
drop policy if exists "Creator delete LIFE groups" on public.karaso_life_groups;
create policy "Creator delete LIFE groups" on public.karaso_life_groups for delete to authenticated using (created_by=auth.uid());
create table if not exists public.karaso_life_group_members (
 id uuid primary key default gen_random_uuid(),
 group_id uuid not null references public.karaso_life_groups(id) on delete cascade,
 profile_id uuid not null references auth.users(id) on delete cascade,
 rank_label text not null default 'Member',
 joined_at timestamptz not null default now(),
 unique(group_id,profile_id)
);
alter table public.karaso_life_group_members enable row level security;
drop policy if exists "LIFE group members public read" on public.karaso_life_group_members;
create policy "LIFE group members public read" on public.karaso_life_group_members for select using (true);
drop policy if exists "Users join LIFE groups as themselves" on public.karaso_life_group_members;
create policy "Users join LIFE groups as themselves" on public.karaso_life_group_members for insert to authenticated with check (profile_id=auth.uid() and rank_label='Member');
drop policy if exists "Users leave LIFE groups themselves" on public.karaso_life_group_members;
create policy "Users leave LIFE groups themselves" on public.karaso_life_group_members for delete to authenticated using (profile_id=auth.uid());
drop policy if exists "Group creator manages membership" on public.karaso_life_group_members;
create policy "Group creator manages membership" on public.karaso_life_group_members for all to authenticated using (exists(select 1 from public.karaso_life_groups g where g.id=group_id and g.created_by=auth.uid())) with check (exists(select 1 from public.karaso_life_groups g where g.id=group_id and g.created_by=auth.uid()));

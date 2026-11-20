-- KARASO forum identity + moderation migration
alter table public.profiles add column if not exists display_name text;
update public.profiles p set display_name = coalesce(nullif(p.display_name,''), nullif(u.raw_user_meta_data->>'display_name',''), 'بازیکن') from auth.users u where u.id=p.id;
alter table public.forum_topics add column if not exists author_name text;
alter table public.forum_topics add column if not exists author_role text;
alter table public.forum_posts add column if not exists author_name text;
alter table public.forum_posts add column if not exists author_role text;
create or replace function public.karaso_set_forum_author() returns trigger language plpgsql security definer set search_path=public as $$
declare v_name text; v_role text;
begin
 select coalesce(nullif(display_name,''),'بازیکن'), coalesce(role,'customer') into v_name,v_role from public.profiles where id=auth.uid();
 if v_name is null then v_name:='بازیکن'; end if; if v_role is null then v_role:='customer'; end if;
 new.author_name:=v_name; new.author_role:=v_role;
 return new;
end; $$;
drop trigger if exists karaso_topic_author on public.forum_topics;
create trigger karaso_topic_author before insert on public.forum_topics for each row execute function public.karaso_set_forum_author();
drop trigger if exists karaso_post_author on public.forum_posts;
create trigger karaso_post_author before insert on public.forum_posts for each row execute function public.karaso_set_forum_author();
-- Do not store or expose email addresses as forum author identity.
alter table public.forum_posts drop column if exists author_email;
-- Allow staff to remove inappropriate replies and topics. Existing read/write policies remain active.
drop policy if exists "staff delete forum posts" on public.forum_posts;
create policy "staff delete forum posts" on public.forum_posts for delete to authenticated using (public.karaso_is_staff());
drop policy if exists "staff delete forum topics" on public.forum_topics;
create policy "staff delete forum topics" on public.forum_topics for delete to authenticated using (public.karaso_is_staff());

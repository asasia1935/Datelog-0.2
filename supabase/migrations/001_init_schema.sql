-- DateLog MVP initial schema and RLS policies.
-- Scope: database tables, constraints, triggers, RLS, and invite-join RPC only.
-- Storage bucket/policies are intentionally not created in this migration.
-- TODO: Add Storage policies for paths:
-- couples/{coupleId}/logs/{logId}/{fileName}

create extension if not exists pgcrypto;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.couples (
  id uuid primary key default gen_random_uuid(),
  name text not null default '우리의 DateLog',
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.couple_members (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null,
  joined_at timestamptz not null default now(),
  constraint couple_members_role_check check (role in ('owner', 'member')),
  constraint couple_members_user_id_key unique (user_id),
  constraint couple_members_couple_user_key unique (couple_id, user_id)
);

create table public.couple_invites (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  code text not null,
  created_by uuid not null references auth.users(id) on delete restrict,
  expires_at timestamptz,
  used_at timestamptz,
  created_at timestamptz not null default now(),
  constraint couple_invites_code_key unique (code)
);

create table public.date_logs (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  log_date date not null,
  title text not null,
  content text,
  rating_user_1 int,
  rating_user_2 int,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint date_logs_rating_user_1_check
    check (rating_user_1 is null or rating_user_1 between 1 and 5),
  constraint date_logs_rating_user_2_check
    check (rating_user_2 is null or rating_user_2 between 1 and 5)
);

create table public.log_photos (
  id uuid primary key default gen_random_uuid(),
  couple_id uuid not null references public.couples(id) on delete cascade,
  log_id uuid not null references public.date_logs(id) on delete cascade,
  storage_path text not null,
  caption text,
  sort_order int not null default 0,
  created_by uuid not null references auth.users(id) on delete restrict,
  created_at timestamptz not null default now(),
  constraint log_photos_sort_order_check check (sort_order >= 0),
  constraint log_photos_storage_path_key unique (storage_path)
);

create index profiles_updated_at_idx on public.profiles(updated_at);
create index couples_created_by_idx on public.couples(created_by);
create index couple_members_couple_id_idx on public.couple_members(couple_id);
create index couple_invites_couple_id_idx on public.couple_invites(couple_id);
create index date_logs_couple_date_idx on public.date_logs(couple_id, log_date);
create index log_photos_log_sort_idx on public.log_photos(log_id, sort_order);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger couples_set_updated_at
before update on public.couples
for each row execute function public.set_updated_at();

create trigger date_logs_set_updated_at
before update on public.date_logs
for each row execute function public.set_updated_at();

create or replace function public.is_couple_member(
  target_couple_id uuid,
  target_user_id uuid default auth.uid()
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.couple_members cm
    where cm.couple_id = target_couple_id
      and cm.user_id = target_user_id
  );
$$;

create or replace function public.can_insert_owner_member(
  target_couple_id uuid,
  target_user_id uuid
)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.couples c
    where c.id = target_couple_id
      and c.created_by = target_user_id
  );
$$;

create or replace function public.ensure_couple_member_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  current_member_count int;
begin
  perform pg_advisory_xact_lock(hashtextextended(new.couple_id::text, 0));

  if exists (
    select 1
    from public.couple_members cm
    where cm.user_id = new.user_id
      and cm.couple_id <> new.couple_id
  ) then
    raise exception 'A user can join only one couple in DateLog v1.';
  end if;

  select count(*)
    into current_member_count
  from public.couple_members cm
  where cm.couple_id = new.couple_id;

  if current_member_count >= 2 then
    raise exception 'A couple can have at most two members in DateLog v1.';
  end if;

  return new;
end;
$$;

create trigger couple_members_limit_before_insert
before insert on public.couple_members
for each row execute function public.ensure_couple_member_limit();

create or replace function public.ensure_log_photo_constraints()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  photo_count int;
  expected_couple_id uuid;
begin
  select dl.couple_id
    into expected_couple_id
  from public.date_logs dl
  where dl.id = new.log_id;

  if expected_couple_id is null then
    raise exception 'The target date log does not exist.';
  end if;

  if expected_couple_id <> new.couple_id then
    raise exception 'log_photos.couple_id must match date_logs.couple_id.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(new.log_id::text, 0));

  select count(*)
    into photo_count
  from public.log_photos lp
  where lp.log_id = new.log_id;

  if photo_count >= 3 then
    raise exception 'A date log can have at most three photos in DateLog v1.';
  end if;

  return new;
end;
$$;

create trigger log_photos_constraints_before_insert
before insert on public.log_photos
for each row execute function public.ensure_log_photo_constraints();

-- Invite-join RPC.
-- v1 marks used_at on success, making an invite code single-use.
-- Since v1 couples are limited to two members, this matches the initial product policy.
create or replace function public.join_couple_by_invite_code(invite_code text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  current_user_id uuid := auth.uid();
  target_invite public.couple_invites%rowtype;
  target_member_count int;
begin
  if current_user_id is null then
    raise exception 'Login is required to join a couple.';
  end if;

  select *
    into target_invite
  from public.couple_invites ci
  where ci.code = invite_code
    and ci.used_at is null
    and (ci.expires_at is null or ci.expires_at > now())
  limit 1;

  if target_invite.id is null then
    raise exception 'Invite code does not exist or is no longer valid.';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(target_invite.couple_id::text, 0));

  if exists (
    select 1
    from public.couple_members cm
    where cm.user_id = current_user_id
  ) then
    raise exception 'The current user already belongs to a couple.';
  end if;

  select count(*)
    into target_member_count
  from public.couple_members cm
  where cm.couple_id = target_invite.couple_id;

  if target_member_count >= 2 then
    raise exception 'The target couple is already full.';
  end if;

  insert into public.couple_members (couple_id, user_id, role)
  values (target_invite.couple_id, current_user_id, 'member');

  update public.couple_invites
  set used_at = now()
  where id = target_invite.id;

  return target_invite.couple_id;
end;
$$;

alter table public.profiles enable row level security;
alter table public.couples enable row level security;
alter table public.couple_members enable row level security;
alter table public.couple_invites enable row level security;
alter table public.date_logs enable row level security;
alter table public.log_photos enable row level security;

create policy "Users can select own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (id = auth.uid());

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create policy "Members can select their couples"
on public.couples
for select
to authenticated
using (public.is_couple_member(id));

create policy "Authenticated users can create couples"
on public.couples
for insert
to authenticated
with check (created_by = auth.uid());

create policy "Members can update their couples"
on public.couples
for update
to authenticated
using (public.is_couple_member(id))
with check (public.is_couple_member(id));

create policy "Members can select members of their couples"
on public.couple_members
for select
to authenticated
using (public.is_couple_member(couple_id));

-- Direct couple_members insert is intentionally restricted.
-- Owner insertion is allowed only for the user who created the couple.
-- Invite participation should use public.join_couple_by_invite_code() instead of
-- direct client inserts, because invite validation needs transactional checks.
create policy "Creators can insert themselves as owner"
on public.couple_members
for insert
to authenticated
with check (
  user_id = auth.uid()
  and role = 'owner'
  and public.can_insert_owner_member(couple_id, auth.uid())
);

create policy "Members can select invites for their couples"
on public.couple_invites
for select
to authenticated
using (public.is_couple_member(couple_id));

create policy "Members can create invites for their couples"
on public.couple_invites
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_couple_member(couple_id)
);

create policy "Members can update invites for their couples"
on public.couple_invites
for update
to authenticated
using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id));

create policy "Members can select date logs"
on public.date_logs
for select
to authenticated
using (public.is_couple_member(couple_id));

create policy "Members can insert date logs"
on public.date_logs
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_couple_member(couple_id)
);

create policy "Members can update date logs"
on public.date_logs
for update
to authenticated
using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id));

create policy "Members can delete date logs"
on public.date_logs
for delete
to authenticated
using (public.is_couple_member(couple_id));

create policy "Members can select log photos"
on public.log_photos
for select
to authenticated
using (public.is_couple_member(couple_id));

create policy "Members can insert log photos"
on public.log_photos
for insert
to authenticated
with check (
  created_by = auth.uid()
  and public.is_couple_member(couple_id)
);

create policy "Members can update log photos"
on public.log_photos
for update
to authenticated
using (public.is_couple_member(couple_id))
with check (public.is_couple_member(couple_id));

create policy "Members can delete log photos"
on public.log_photos
for delete
to authenticated
using (public.is_couple_member(couple_id));

-- Residences: every neighbor belongs to exactly one residence and only sees the
-- profiles, items, photos and requests of that residence.
--
-- The admin picks the residence when inviting someone, by putting its id in the
-- login's app_metadata (which the neighbor cannot change):
--   update auth.users
--   set raw_app_meta_data = raw_app_meta_data || jsonb_build_object('residence_id', '<residence id>')
--   where email = 'voisin@example.com';
-- On first sign-in the profile is created in that residence.

create table public.residences (
  id         uuid primary key default gen_random_uuid(),
  name       text,
  address    text not null check (length(address) between 1 and 200),
  created_at timestamptz not null default now()
);

revoke all on public.residences from anon, authenticated;
grant select on public.residences to authenticated;
alter table public.residences enable row level security;

-- Profiles get a residence (filled in below, then made required).
alter table public.profiles add column residence_id uuid references public.residences (id);

-- The signed-in neighbor's residence: from their profile, or before the profile
-- exists, from the residence the admin set on their login. Security definer so
-- policies on profiles can use it without recursion; kept out of the API schema.
create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.my_residence_id()
returns uuid
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(
    (select p.residence_id from public.profiles p where p.user_id = (select auth.uid())),
    (select nullif(u.raw_app_meta_data ->> 'residence_id', '')::uuid
       from auth.users u where u.id = (select auth.uid()))
  );
$$;

revoke all on function private.my_residence_id() from public;
grant execute on function private.my_residence_id() to authenticated;

-- Existing neighbors go to the first residence.
with first_residence as (
  insert into public.residences (address) values ('333 rue des Pyrénées') returning id
)
update public.profiles set residence_id = (select id from first_residence);

-- Demo neighbors (no login) and their items are no longer needed.
delete from public.profiles where user_id is null;

update auth.users u
set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb)
  || jsonb_build_object('residence_id', p.residence_id)
from public.profiles p
where p.user_id = u.id;

alter table public.profiles
  alter column residence_id set not null,
  alter column residence_id set default private.my_residence_id();
create index profiles_residence_id_idx on public.profiles (residence_id);

-- Neighbors never choose or change their residence (column-level grants).
revoke insert, update on public.profiles from authenticated;
grant insert (user_id, civility, last_name, location, photo_path) on public.profiles to authenticated;
grant update (civility, last_name, location, photo_path) on public.profiles to authenticated;


-- Policies: everything visible is limited to the neighbor's residence. ------

create policy "See my residence" on public.residences
  for select to authenticated using (id = (select private.my_residence_id()));

drop policy "Neighbors can see profiles" on public.profiles;
create policy "See neighbors of my residence" on public.profiles
  for select to authenticated using (residence_id = (select private.my_residence_id()));

drop policy "Create my own profile" on public.profiles;
create policy "Create my own profile in my residence" on public.profiles
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and residence_id = (select private.my_residence_id())
  );

drop policy "Neighbors can see items" on public.items;
create policy "See items of my residence" on public.items
  for select to authenticated
  using (owner_id in (
    select id from public.profiles where residence_id = (select private.my_residence_id())
  ));

drop policy "Neighbors can see wanted requests" on public.wanted_requests;
create policy "See wanted requests of my residence" on public.wanted_requests
  for select to authenticated
  using (author_id in (
    select id from public.profiles where residence_id = (select private.my_residence_id())
  ));

-- Borrow requests already require being the borrower or the item's owner, and
-- "Ask to borrow" only accepts items the neighbor can see (same residence).

drop policy "Neighbors can see photos" on storage.objects;
create policy "See photos of my residence" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'photos'
    and (storage.foldername(name))[1] in (
      select user_id::text from public.profiles
      where residence_id = (select private.my_residence_id())
    )
  );

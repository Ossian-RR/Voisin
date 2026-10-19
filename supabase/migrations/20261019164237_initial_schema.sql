-- Voisin: first schema (applied to project oftfclpcxjdemnhzbfjz on 2026-10-19).
--
-- Access model (invite only):
--   * Public sign-ups are disabled; only invited neighbors can sign in,
--     so "signed in" means "a neighbor", and neighbors can read the shared data.
--   * Visitors who are not signed in (anon) get no access to any table.
--   * Each row can only be changed by the neighbor who owns it.
--   * Demo neighbors (supabase/seed.sql) have no login (user_id is null), so nobody can edit them.

-- 1. Profiles ---------------------------------------------------------------

create table public.profiles (
  id          uuid primary key default gen_random_uuid(),
  -- The neighbor's login. Null for demo neighbors.
  user_id     uuid unique references auth.users (id) on delete cascade,
  civility    text not null check (civility in ('Monsieur', 'Madame', 'Famille')),
  first_name  text,
  last_name   text not null,
  -- Flat reference X-Nn, e.g. "A-3a".
  location    text not null check (location ~ '^[A-Z]-[0-9]+[a-z]$'),
  -- Path in the "photos" storage bucket.
  photo_path  text,
  -- Day the neighbor was admitted to Voisin. Set automatically when the profile is
  -- created; only you (the admin, from the Supabase dashboard) can change it.
  admitted_on date not null default current_date,
  created_at  timestamptz not null default now()
);


-- 2. Items ------------------------------------------------------------------

create table public.items (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references public.profiles (id) on delete cascade,
  title        text not null check (length(title) between 1 and 120),
  category     text check (category in ('Tools', 'Garden', 'Cleaning', 'Kitchen', 'Outdoor')),
  kind         text not null default 'loan' check (kind in ('loan', 'gift')),
  status       text not null default 'available' check (status in ('available', 'unavailable', 'removed')),
  description  text not null default '',
  condition    text not null check (condition in ('Neuf', 'Bon état')),
  -- [{ "path": "<storage path>", "label": "...", "hue": 210 }, ...]
  photos       jsonb not null default '[]'::jsonb,
  created_at   timestamptz not null default now()
);

create index items_owner_id_idx on public.items (owner_id);


-- 3. Borrow requests --------------------------------------------------------

create table public.borrow_requests (
  id               uuid primary key default gen_random_uuid(),
  item_id          uuid not null references public.items (id) on delete cascade,
  borrower_id      uuid not null references public.profiles (id) on delete cascade,
  status           text not null default 'pending'
                   check (status in ('pending', 'approved', 'declined', 'returned')),
  requested_from   date,
  requested_until  date,
  created_at       timestamptz not null default now(),
  check (requested_until is null or requested_from is null or requested_until >= requested_from)
);

create index borrow_requests_item_id_idx on public.borrow_requests (item_id);
create index borrow_requests_borrower_id_idx on public.borrow_requests (borrower_id);
-- One open request per neighbor and item.
create unique index borrow_requests_one_open_idx
  on public.borrow_requests (item_id, borrower_id)
  where status in ('pending', 'approved');


-- 4. Wanted requests ("je cherche…") ---------------------------------------

create table public.wanted_requests (
  id          uuid primary key default gen_random_uuid(),
  author_id   uuid not null references public.profiles (id) on delete cascade,
  text        text not null check (length(text) between 1 and 500),
  wanted_on   date,
  wanted_at   time,
  created_at  timestamptz not null default now()
);

create index wanted_requests_author_id_idx on public.wanted_requests (author_id);


-- 5. Table access -----------------------------------------------------------
-- Visitors who are not signed in get nothing. Signed-in neighbors get access,
-- then row-level security (below) decides which rows.

revoke all on public.profiles, public.items, public.borrow_requests, public.wanted_requests from anon;
-- Supabase grants everything to signed-in users by default; start from nothing so the
-- column limits below (admission date, who borrows what) really apply.
revoke all on public.profiles, public.items, public.borrow_requests, public.wanted_requests from authenticated;

-- Neighbors fill in their own details but never their admission date.
grant select on public.profiles to authenticated;
grant insert (user_id, civility, first_name, last_name, location, photo_path) on public.profiles to authenticated;
grant update (civility, first_name, last_name, location, photo_path) on public.profiles to authenticated;
grant select, insert, update, delete on public.items to authenticated;
grant select, insert, delete on public.borrow_requests to authenticated;
-- The owner may only change the status and the dates, never who borrows what.
grant update (status, requested_from, requested_until) on public.borrow_requests to authenticated;
grant select, insert, update, delete on public.wanted_requests to authenticated;

alter table public.profiles        enable row level security;
alter table public.items           enable row level security;
alter table public.borrow_requests enable row level security;
alter table public.wanted_requests enable row level security;


-- 6. Row-level security -----------------------------------------------------
-- "My profile" = the profile whose user_id is the signed-in user.

-- Profiles: every neighbor sees every profile; you create and edit only your own.
create policy "Neighbors can see profiles" on public.profiles
  for select to authenticated using (true);
create policy "Create my own profile" on public.profiles
  for insert to authenticated with check (user_id = (select auth.uid()));
create policy "Edit my own profile" on public.profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

-- Items: every neighbor sees items; only the owner adds, edits or deletes.
create policy "Neighbors can see items" on public.items
  for select to authenticated using (true);
create policy "Add my own items" on public.items
  for insert to authenticated
  with check (owner_id in (select id from public.profiles where user_id = (select auth.uid())));
create policy "Edit my own items" on public.items
  for update to authenticated
  using (owner_id in (select id from public.profiles where user_id = (select auth.uid())))
  with check (owner_id in (select id from public.profiles where user_id = (select auth.uid())));
create policy "Delete my own items" on public.items
  for delete to authenticated
  using (owner_id in (select id from public.profiles where user_id = (select auth.uid())));

-- Borrow requests: only the borrower and the item's owner can see one.
create policy "Borrower and owner see the request" on public.borrow_requests
  for select to authenticated
  using (
    borrower_id in (select id from public.profiles where user_id = (select auth.uid()))
    or item_id in (
      select i.id from public.items i
      join public.profiles p on p.id = i.owner_id
      where p.user_id = (select auth.uid())
    )
  );
-- You ask for someone else's available item, as yourself, starting as "pending".
create policy "Ask to borrow" on public.borrow_requests
  for insert to authenticated
  with check (
    status = 'pending'
    and borrower_id in (select id from public.profiles where user_id = (select auth.uid()))
    and item_id in (
      select i.id from public.items i
      join public.profiles p on p.id = i.owner_id
      where i.status = 'available'
        and p.user_id is distinct from (select auth.uid())
    )
  );
-- The owner approves, declines or marks returned.
create policy "Owner answers the request" on public.borrow_requests
  for update to authenticated
  using (
    item_id in (
      select i.id from public.items i
      join public.profiles p on p.id = i.owner_id
      where p.user_id = (select auth.uid())
    )
  )
  with check (
    item_id in (
      select i.id from public.items i
      join public.profiles p on p.id = i.owner_id
      where p.user_id = (select auth.uid())
    )
  );
-- The borrower can cancel while the request is still pending.
create policy "Borrower cancels a pending request" on public.borrow_requests
  for delete to authenticated
  using (
    status = 'pending'
    and borrower_id in (select id from public.profiles where user_id = (select auth.uid()))
  );

-- Wanted requests: every neighbor sees them; only the author changes them.
create policy "Neighbors can see wanted requests" on public.wanted_requests
  for select to authenticated using (true);
create policy "Post my own wanted requests" on public.wanted_requests
  for insert to authenticated
  with check (author_id in (select id from public.profiles where user_id = (select auth.uid())));
create policy "Edit my own wanted requests" on public.wanted_requests
  for update to authenticated
  using (author_id in (select id from public.profiles where user_id = (select auth.uid())))
  with check (author_id in (select id from public.profiles where user_id = (select auth.uid())));
create policy "Delete my own wanted requests" on public.wanted_requests
  for delete to authenticated
  using (author_id in (select id from public.profiles where user_id = (select auth.uid())));


-- 7. Photo storage ----------------------------------------------------------
-- Private bucket: photos are only shown to signed-in neighbors (through short-lived links).
-- Each neighbor uploads into a folder named after their login id: "<user id>/<file>.jpg".

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('photos', 'photos', false, 2097152, array['image/jpeg', 'image/png', 'image/webp']);

create policy "Neighbors can see photos" on storage.objects
  for select to authenticated
  using (bucket_id = 'photos');
create policy "Upload into my own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
-- Needed to replace a photo (upsert needs select + insert + update).
create policy "Replace photos in my own folder" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
create policy "Delete photos in my own folder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text);



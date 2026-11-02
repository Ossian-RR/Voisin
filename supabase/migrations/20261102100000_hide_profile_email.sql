-- The sign-in e-mail on each profile is for the admin only (dashboard).
-- "grant select on public.profiles" (first migration) covered the whole
-- table, so the email column added later was readable by every neighbor of
-- the same residence. Neighbors now read every column except email.

revoke select on public.profiles from authenticated;
grant select (id, user_id, civility, last_name, location, photo_path,
              admitted_on, created_at, residence_id, confirmed_at)
  on public.profiles to authenticated;

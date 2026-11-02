-- Bounds the database enforces even if the app is bypassed (plan 8.4).
-- The same numbers live in shared/profile.ts and shared/new-item.ts.
-- "not valid": checked on every new or edited row, without failing on rows
-- saved before this migration.

alter table public.profiles
  add constraint profiles_last_name_length
  check (length(last_name) between 1 and 60) not valid;

alter table public.items
  add constraint items_description_length
  check (length(description) <= 2000) not valid;

-- Photos: a list of at most 5 (the app asks for 2 to 5).
alter table public.items
  add constraint items_photos_count
  check (jsonb_typeof(photos) = 'array' and jsonb_array_length(photos) <= 5) not valid;

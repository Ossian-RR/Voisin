-- Profiles no longer have a first name: neighbors are shown as civility + last name
-- (e.g. "Madame Martin"). This change was made from the Supabase dashboard on
-- 2026-10-20; the file keeps the repo's schema in step with the database.
alter table public.profiles drop column if exists first_name;

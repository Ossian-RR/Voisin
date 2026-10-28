-- A neighbor confirms their profile by pressing "Enregistrer" on the Profil page.
alter table public.profiles add column confirmed_at timestamptz;
grant update (confirmed_at) on public.profiles to authenticated;

-- The Aide page only accepts messages from confirmed profiles.
drop policy "Send help as myself" on public.help_messages;
create policy "Send help as myself, once my profile is confirmed" on public.help_messages
  for insert to authenticated
  with check (profile_id in (
    select id from public.profiles
    where user_id = (select auth.uid()) and confirmed_at is not null
  ));

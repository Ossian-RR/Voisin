-- Photos (plan 8.5): a signed-in person could write any file name in their own
-- folder, even without a profile or a residence. Now only the two paths the
-- app uses are accepted (see itemPhotoPath and avatarPath in shared/db.ts):
--   <user id>/avatar.jpg                  once they have a profile (Profil page,
--                                         possibly before joining a residence)
--   <user id>/items/<item id>/<n>.jpg     once they belong to a residence

create or replace function private.can_write_photo(name text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select case
    when name = (select auth.uid())::text || '/avatar.jpg' then
      exists (select 1 from public.profiles where user_id = (select auth.uid()))
    when name ~ ('^' || (select auth.uid())::text || '/items/[0-9a-f-]{36}/[0-9]+\.jpg$') then
      (select private.my_residence_id()) is not null
    else false
  end;
$$;
revoke all on function private.can_write_photo(text) from public;
grant execute on function private.can_write_photo(text) to authenticated;

drop policy "Upload into my own folder" on storage.objects;
create policy "Upload my avatar or my item photos" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (select private.can_write_photo(name)));

drop policy "Replace photos in my own folder" on storage.objects;
create policy "Replace my avatar or my item photos" on storage.objects
  for update to authenticated
  using (bucket_id = 'photos' and (storage.foldername(name))[1] = (select auth.uid())::text)
  with check (bucket_id = 'photos' and (select private.can_write_photo(name)));

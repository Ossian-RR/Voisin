-- A neighbor can have a profile before belonging to a residence: they fill in
-- their profile, then ask (Aide) to join or create one. Until the admin
-- attaches them, they only see their own profile.

alter table public.profiles alter column residence_id drop not null;

-- See my own profile even without a residence.
drop policy "See neighbors of my residence" on public.profiles;
create policy "See my profile and my residence's neighbors" on public.profiles
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or residence_id = (select private.my_residence_id())
  );

-- Create my profile, with no residence or the one the admin set.
drop policy "Create my own profile in my residence" on public.profiles;
create policy "Create my own profile" on public.profiles
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and residence_id is not distinct from (select private.my_residence_id())
  );

-- The admin helper also moves existing profiles into the residence.
create or replace function private.add_to_residence(residence uuid, emails text[])
returns integer
language sql
security definer
set search_path = ''
as $$
  with attached as (
    update auth.users
    set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb)
      || jsonb_build_object('residence_id', residence)
    where lower(email) in (select lower(trim(e)) from unnest(emails) as e)
    returning id
  ), moved as (
    update public.profiles set residence_id = residence
    where user_id in (select id from attached)
  )
  select count(*)::integer from attached;
$$;
revoke all on function private.add_to_residence(uuid, text[]) from public;

-- New Aide topic for people without a residence.
alter table public.help_messages drop constraint help_messages_topic_check;
alter table public.help_messages add constraint help_messages_topic_check
  check (topic in ('Rejoindre une résidence existante', 'Créer notre résidence', 'Ajouter des voisins ou des étages', 'Autre question'));

-- The e-mail mentions when the neighbor has no residence yet.
create or replace function private.notify_help_message()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  who text;
begin
  select format('%s %s, logement %s, %s', p.civility, p.last_name, p.location,
                coalesce(coalesce(nullif(r.name, '') || ', ', '') || r.address, 'sans résidence pour l''instant'))
    into who
  from public.profiles p left join public.residences r on r.id = p.residence_id
  where p.id = new.profile_id;
  perform private.email_admin(
    'Voisin (Aide) : ' || new.topic,
    format(E'%s\n\n—\n%s\nRépondre à : %s', new.message, coalesce(who, 'Voisin inconnu'), new.reply_email),
    new.reply_email
  );
  return new;
end;
$$;

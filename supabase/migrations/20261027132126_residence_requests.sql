-- Requests from people whose residence is not on Voisin yet. Anyone (signed in
-- or not) can send one; nobody can read them through the app: the admin reads
-- them in the Supabase dashboard (Table Editor -> residence_requests).
--
-- Each new request e-mails the admin through Resend, if these Vault secrets
-- exist (Project Settings -> Vault): resend_api_key, admin_email.

create extension if not exists pg_net;

create table public.residence_requests (
  id           uuid primary key default gen_random_uuid(),
  contact_name text not null check (length(contact_name) between 1 and 100),
  email        text not null check (length(email) <= 200 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'),
  address      text not null check (length(address) between 1 and 200),
  flats        integer check (flats between 1 and 2000),
  message      text check (length(message) <= 2000),
  -- new / done / refused, set by the admin.
  status       text not null default 'new' check (status in ('new', 'done', 'refused')),
  created_at   timestamptz not null default now()
);

alter table public.residence_requests enable row level security;
revoke all on public.residence_requests from anon, authenticated;
grant insert (contact_name, email, address, flats, message)
  on public.residence_requests to anon, authenticated;

create policy "Anyone can ask for a residence" on public.residence_requests
  for insert to anon, authenticated
  with check (status = 'new');

-- Light spam guard: one request per e-mail per day, 30 per hour overall.
create or replace function private.limit_residence_requests()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if exists (
    select 1 from public.residence_requests
    where lower(email) = lower(new.email) and created_at > now() - interval '1 day'
  ) then
    raise exception 'already_requested' using errcode = 'P0001';
  end if;
  if (select count(*) from public.residence_requests where created_at > now() - interval '1 hour') >= 30 then
    raise exception 'too_many_requests' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

create trigger limit_residence_requests
  before insert on public.residence_requests
  for each row execute function private.limit_residence_requests();

-- E-mail to the admin. Sent asynchronously: a failure never blocks the request.
create or replace function private.notify_residence_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  api_key text;
  admin   text;
begin
  select decrypted_secret into api_key from vault.decrypted_secrets where name = 'resend_api_key';
  select decrypted_secret into admin from vault.decrypted_secrets where name = 'admin_email';
  if api_key is null or admin is null then
    return new;
  end if;
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || api_key,
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'Voisin <connexion@voisin.ossianlead.fr>',
      'to', jsonb_build_array(admin),
      'reply_to', new.email,
      'subject', 'Voisin : nouvelle demande de résidence (' || new.address || ')',
      'text', format(
        E'%s (%s) demande Voisin pour sa résidence.\n\nAdresse : %s\nLogements : %s\n\n%s\n\nRépondez directement à cet e-mail pour lui écrire.',
        new.contact_name, new.email, new.address,
        coalesce(new.flats::text, 'non précisé'), coalesce(new.message, '')
      )
    )
  );
  return new;
end;
$$;

create trigger notify_residence_request
  after insert on public.residence_requests
  for each row execute function private.notify_residence_request();

-- Admin helper, for the SQL Editor only (not reachable from the app):
--   select private.add_to_residence('<residence id>', array['a@exemple.fr', 'b@exemple.fr']);
-- Returns how many invited logins were found and attached.
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
    returning 1
  )
  select count(*)::integer from attached;
$$;

revoke all on function private.limit_residence_requests() from public;
revoke all on function private.notify_residence_request() from public;
revoke all on function private.add_to_residence(uuid, text[]) from public;

-- Minimal copy of what the Supabase platform provides before our migrations
-- run: roles, auth.uid(), auth.users, storage, Vault and pg_net. Only used by
-- the isolation test (supabase/tests/run.sh), never applied to the real base.
--
-- Default privileges mimic Supabase: anon and authenticated get everything on
-- new tables and functions in public, so a migration that forgets a "revoke"
-- is caught by the test.

-- Roles belong to the whole server: create them only once.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'anon') then
    create role anon nologin noinherit;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then
    create role authenticated nologin noinherit;
  end if;
end;
$$;

grant usage on schema public to anon, authenticated;
alter default privileges in schema public grant all on tables to anon, authenticated;
alter default privileges in schema public grant all on functions to anon, authenticated;
alter default privileges in schema public grant all on sequences to anon, authenticated;

-- Supabase's "enable RLS automatically" event trigger function.
create function public.rls_auto_enable() returns event_trigger
language plpgsql as $$ begin end; $$;

-- Auth ------------------------------------------------------------------------
create schema auth;
grant usage on schema auth to anon, authenticated;

create table auth.users (
  id                uuid primary key default gen_random_uuid(),
  email             text,
  raw_app_meta_data jsonb default '{}'::jsonb
);

-- Same as Supabase: the user id comes from the request's JWT.
create function auth.uid() returns uuid
language sql stable as $$
  select coalesce(
    nullif(current_setting('request.jwt.claim.sub', true), ''),
    (nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub')
  )::uuid
$$;
grant execute on function auth.uid() to anon, authenticated;

-- Storage -----------------------------------------------------------------------
create schema storage;
grant usage on schema storage to anon, authenticated;

create table storage.buckets (
  id                 text primary key,
  name               text not null,
  public             boolean default false,
  file_size_limit    bigint,
  allowed_mime_types text[]
);

create table storage.objects (
  id        uuid primary key default gen_random_uuid(),
  bucket_id text references storage.buckets (id),
  name      text not null,
  owner     uuid default auth.uid(),
  unique (bucket_id, name)
);
alter table storage.objects enable row level security;
grant select, insert, update, delete on storage.objects to anon, authenticated;
grant select on storage.buckets to anon, authenticated;

-- Folders of a path: "a/b/c.jpg" -> {a,b}.
create function storage.foldername(name text) returns text[]
language plpgsql immutable as $$
declare _parts text[];
begin
  _parts := string_to_array(name, '/');
  return _parts[1:array_length(_parts, 1) - 1];
end;
$$;
grant execute on function storage.foldername(text) to anon, authenticated;

-- Vault: no secrets, so no e-mail is ever sent by the test. ---------------------
create schema vault;
create table vault.decrypted_secrets (name text, decrypted_secret text);

-- pg_net: the extension does not exist here (run.sh skips "create extension
-- pg_net"); this records calls instead of sending them. --------------------------
create schema extensions;
create schema net;
create table net.calls (url text, headers jsonb, body jsonb);
create function net.http_post(url text, headers jsonb default '{}', body jsonb default '{}')
returns bigint language sql as $$
  insert into net.calls values (url, headers, body);
  select 1::bigint;
$$;

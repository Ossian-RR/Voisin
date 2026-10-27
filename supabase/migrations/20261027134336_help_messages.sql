-- Messages sent from the Aide page by signed-in neighbors. Each one e-mails
-- the admin (Vault secret admin_email) through Resend, with the neighbor as
-- reply-to. Nobody reads them through the app: Table Editor -> help_messages.

-- One place that sends an e-mail to the admin; does nothing without the Vault secrets.
create or replace function private.email_admin(subject text, body text, reply_to text)
returns void
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
    return;
  end if;
  perform net.http_post(
    url := 'https://api.resend.com/emails',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || trim(api_key),
      'Content-Type', 'application/json'
    ),
    body := jsonb_build_object(
      'from', 'Voisin <connexion@voisin.ossianlead.fr>',
      'to', jsonb_build_array(trim(admin)),
      'reply_to', reply_to,
      'subject', subject,
      'text', body
    )
  );
end;
$$;

-- Residence requests now use the shared function.
create or replace function private.notify_residence_request()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.email_admin(
    'Voisin : nouvelle demande de résidence (' || new.address || ')',
    format(
      E'%s (%s) demande Voisin pour sa résidence.\n\nAdresse : %s\nLogements : %s\n\n%s\n\nRépondez directement à cet e-mail pour lui écrire.',
      new.contact_name, new.email, new.address,
      coalesce(new.flats::text, 'non précisé'), coalesce(new.message, '')
    ),
    new.email
  );
  return new;
end;
$$;

create table public.help_messages (
  id          uuid primary key default gen_random_uuid(),
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  topic       text not null check (topic in ('Créer notre résidence', 'Ajouter des voisins ou des étages', 'Autre question')),
  message     text not null check (length(message) between 1 and 2000),
  reply_email text not null check (length(reply_email) <= 200 and reply_email ~ '^[^\s@]+@[^\s@]+\.[^\s@]{2,}$'),
  created_at  timestamptz not null default now()
);

create index help_messages_profile_id_idx on public.help_messages (profile_id);

alter table public.help_messages enable row level security;
revoke all on public.help_messages from anon, authenticated;
grant insert (profile_id, topic, message, reply_email) on public.help_messages to authenticated;

create policy "Send help as myself" on public.help_messages
  for insert to authenticated
  with check (profile_id in (select id from public.profiles where user_id = (select auth.uid())));

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
                coalesce(nullif(r.name, '') || ', ', '') || r.address)
    into who
  from public.profiles p join public.residences r on r.id = p.residence_id
  where p.id = new.profile_id;
  perform private.email_admin(
    'Voisin (Aide) : ' || new.topic,
    format(E'%s\n\n—\n%s\nRépondre à : %s', new.message, coalesce(who, 'Voisin inconnu'), new.reply_email),
    new.reply_email
  );
  return new;
end;
$$;

create trigger notify_help_message
  after insert on public.help_messages
  for each row execute function private.notify_help_message();

revoke all on function private.email_admin(text, text, text) from public;
revoke all on function private.notify_help_message() from public;

-- Each Aide message e-mails the admin: at most 5 per neighbor per day, so a
-- mistake or a stolen session can't flood the admin's inbox.

create or replace function private.limit_help_messages()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*) from public.help_messages
    where profile_id = new.profile_id and created_at > now() - interval '1 day'
  ) >= 5 then
    raise exception 'too_many_help_messages' using errcode = 'P0001';
  end if;
  return new;
end;
$$;
revoke all on function private.limit_help_messages() from public;

create trigger limit_help_messages
  before insert on public.help_messages
  for each row execute function private.limit_help_messages();

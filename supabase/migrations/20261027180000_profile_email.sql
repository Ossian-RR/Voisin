-- Each profile shows the sign-in e-mail, so the admin can read it in the
-- dashboard. The database fills it in and keeps it up to date; neighbors can't
-- read or change it (no column grant to authenticated).

alter table public.profiles add column email text;

update public.profiles p set email = u.email
from auth.users u
where u.id = p.user_id;

-- New profile: copy the e-mail of its login.
create or replace function private.set_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.email := (select email from auth.users where id = new.user_id);
  return new;
end;
$$;
revoke all on function private.set_profile_email() from public;

create trigger set_profile_email
  before insert on public.profiles
  for each row execute function private.set_profile_email();

-- Login e-mail changed: follow it.
create or replace function private.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where user_id = new.id;
  return new;
end;
$$;
revoke all on function private.sync_profile_email() from public;

create trigger sync_profile_email
  after update of email on auth.users
  for each row when (old.email is distinct from new.email)
  execute function private.sync_profile_email();

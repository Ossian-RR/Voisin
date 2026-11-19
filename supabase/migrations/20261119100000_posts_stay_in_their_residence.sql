-- An item or a "Je cherche" belongs to the residence where it was published,
-- not to its author's current residence. Until now, visibility followed the
-- author's profile: when the admin moved a neighbor into a new residence
-- (private.add_to_residence), all their items and searches followed them, so a
-- residence just created was not empty (seen on 19 November 2026).
--
-- Now each row keeps the residence it was published in, filled in by the
-- database (the app cannot choose or change it). A row is visible only in that
-- residence, and only while its author still lives there: a neighbor who
-- moves leaves their items and searches behind, hidden from everyone. If they
-- come back, everything reappears. Nothing is deleted.

alter table public.items
  add column residence_id uuid references public.residences (id) on delete set null;
alter table public.wanted_requests
  add column residence_id uuid references public.residences (id) on delete set null;

create index items_residence_id_idx on public.items (residence_id);
create index wanted_requests_residence_id_idx on public.wanted_requests (residence_id);

-- Existing rows: the author's current residence, unless the row is older than
-- that residence (it was published elsewhere, before the move: left with no
-- residence, so hidden). The first residence is the exception: it was created
-- by the 23 October 2026 migration around neighbors who already had items.
with first_residence as (
  select id from public.residences order by created_at limit 1
)
update public.items i
set residence_id = r.id
from public.profiles p
join public.residences r on r.id = p.residence_id
where p.id = i.owner_id
  and (i.created_at >= r.created_at or r.id = (select id from first_residence));

with first_residence as (
  select id from public.residences order by created_at limit 1
)
update public.wanted_requests w
set residence_id = r.id
from public.profiles p
join public.residences r on r.id = p.residence_id
where p.id = w.author_id
  and (w.created_at >= r.created_at or r.id = (select id from first_residence));

-- Filled in on insert from the author's profile; never changed afterwards,
-- whatever the request sends.
create or replace function private.stamp_residence()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' then
    new.residence_id := old.residence_id;
  elsif tg_table_name = 'items' then
    select residence_id into new.residence_id from public.profiles where id = new.owner_id;
  else
    select residence_id into new.residence_id from public.profiles where id = new.author_id;
  end if;
  return new;
end;
$$;
revoke all on function private.stamp_residence() from public;

create trigger stamp_residence
  before insert or update on public.items
  for each row execute function private.stamp_residence();
create trigger stamp_residence
  before insert or update on public.wanted_requests
  for each row execute function private.stamp_residence();

-- Visible in its residence, while its author still lives there.
drop policy "See items of my residence" on public.items;
create policy "See items of my residence" on public.items
  for select to authenticated
  using (
    residence_id = (select private.my_residence_id())
    and owner_id in (
      select id from public.profiles where residence_id = (select private.my_residence_id())
    )
  );

drop policy "See wanted requests of my residence" on public.wanted_requests;
create policy "See wanted requests of my residence" on public.wanted_requests
  for select to authenticated
  using (
    residence_id = (select private.my_residence_id())
    and author_id in (
      select id from public.profiles where residence_id = (select private.my_residence_id())
    )
  );

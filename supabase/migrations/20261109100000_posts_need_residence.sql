-- A neighbor whose profile has no residence yet (before the admin attaches
-- them) could add items and "Je cherche" requests through the API. Nobody
-- could see them, but they would appear in the residence once the neighbor is
-- attached. The app only offers these pages to members; the base now agrees.
-- Found by the isolation test (supabase/tests/isolation.sql).

drop policy "Add my own items" on public.items;
create policy "Add my own items, once in a residence" on public.items
  for insert to authenticated
  with check (owner_id in (
    select id from public.profiles
    where user_id = (select auth.uid()) and residence_id is not null
  ));

drop policy "Post my own wanted requests" on public.wanted_requests;
create policy "Post my own wanted requests, once in a residence" on public.wanted_requests
  for insert to authenticated
  with check (author_id in (
    select id from public.profiles
    where user_id = (select auth.uid()) and residence_id is not null
  ));

-- The borrower says when they would like the item: a day (requested_from) and a time.
alter table public.borrow_requests add column requested_at time;
-- The owner may also adjust it when answering.
grant update (requested_at) on public.borrow_requests to authenticated;

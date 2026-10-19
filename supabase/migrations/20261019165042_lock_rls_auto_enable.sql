-- rls_auto_enable() runs from an event trigger as its owner; nobody needs to call it through the API.
-- Revoke from public too, since anon and authenticated inherit PUBLIC's default EXECUTE.
revoke execute on function public.rls_auto_enable() from public, anon, authenticated;

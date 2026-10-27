-- pg_net was installed in the public schema; Supabase recommends the
-- extensions schema. Its functions stay in the "net" schema, so the
-- residence-request e-mail keeps working.
-- NOT YET APPLIED: run it in the Supabase SQL Editor (after the help_messages migration).
drop extension if exists pg_net;
create extension pg_net schema extensions;

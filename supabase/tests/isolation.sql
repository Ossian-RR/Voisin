-- Isolation between residences (plan 8.6), run by supabase/tests/run.sh after
-- the stub and every migration.
--
-- Two residences, A and B:
--   alice, arthur : neighbors in A (alice lends a drill, arthur asked to borrow it)
--   bruno         : neighbor in B
--   nina          : profile without a residence yet
--   zoe           : invited to B, no profile yet
-- Each check runs as one of them (role "authenticated" and their JWT), inside
-- a subtransaction that is always rolled back: checks never change the data.

-- Helpers ---------------------------------------------------------------------
create schema test;
grant usage on schema test to anon, authenticated;

create table test.users (name text primary key, id uuid not null);
create table test.results (n serial, who text, label text, ok boolean, detail text);

-- Who is "signed in" for the next checks.
create function test.login(who text) returns void language sql as $$
  select set_config('request.jwt.claims',
    coalesce(jsonb_build_object('sub', (select id from test.users where name = who), 'role', 'authenticated')::text, ''),
    false);
  select set_config('test.who', who, false);
$$;

create function test.record(label text, ok boolean, detail text) returns void
language sql security definer set search_path = '' as $$
  insert into test.results (who, label, ok, detail)
  values (current_setting('test.who', true), label, ok, detail);
$$;
grant execute on function test.record(text, boolean, text) to anon, authenticated;

-- Runs sql, rolls it back, and returns how many rows it returned or changed.
-- Raises the original error if sql fails.
create function test.run(sql text) returns bigint language plpgsql as $$
declare n bigint;
begin
  begin
    execute sql;
    get diagnostics n = row_count;
    raise exception using errcode = 'ZZ000', message = n::text;
  exception when sqlstate 'ZZ000' then
    return sqlerrm::bigint;
  end;
end;
$$;
grant execute on function test.run(text) to anon, authenticated;

-- The statement must run and return or change exactly `expected` rows.
create function test.rows(label text, sql text, expected bigint) returns void
language plpgsql as $$
declare n bigint;
begin
  n := test.run(sql);
  perform test.record(label, n = expected,
    case when n = expected then null else format('%s ligne(s) au lieu de %s', n, expected) end);
exception when others then
  perform test.record(label, false, format('erreur inattendue %s : %s', sqlstate, sqlerrm));
end;
$$;
grant execute on function test.rows(text, text, bigint) to anon, authenticated;

-- The statement must be refused by the database (missing right or RLS: 42501).
create function test.refused(label text, sql text) returns void
language plpgsql as $$
declare n bigint;
begin
  n := test.run(sql);
  perform test.record(label, false, format('accepté (%s ligne(s))', n));
exception when insufficient_privilege then
  perform test.record(label, true, null);
when others then
  perform test.record(label, false, format('refusé, mais pour une autre raison %s : %s', sqlstate, sqlerrm));
end;
$$;
grant execute on function test.refused(text, text) to anon, authenticated;

-- Data, created by the admin (superuser: no RLS) ---------------------------------
-- Ids are fixed so that checks can name rows they are not allowed to see.
--   residences  A = …a0, B = …b0
--   logins      alice …a1, arthur …a2, bruno …b1, nina …c1, zoe …b2
--   profiles    alice …a11, arthur …a12, bruno …b11, nina …c11
--   items       alice's drill …a21, bruno's ladder …b21
insert into test.users values
  ('alice',  '00000000-0000-0000-0000-0000000000a1'),
  ('arthur', '00000000-0000-0000-0000-0000000000a2'),
  ('bruno',  '00000000-0000-0000-0000-0000000000b1'),
  ('nina',   '00000000-0000-0000-0000-0000000000c1'),
  ('zoe',    '00000000-0000-0000-0000-0000000000b2');

insert into public.residences (id, name, address) values
  ('00000000-0000-0000-0000-0000000000a0', 'Résidence A', '1 rue A'),
  ('00000000-0000-0000-0000-0000000000b0', 'Résidence B', '2 rue B');

insert into auth.users (id, email, raw_app_meta_data) values
  ('00000000-0000-0000-0000-0000000000a1', 'alice@exemple.fr',  '{"residence_id": "00000000-0000-0000-0000-0000000000a0"}'),
  ('00000000-0000-0000-0000-0000000000a2', 'arthur@exemple.fr', '{"residence_id": "00000000-0000-0000-0000-0000000000a0"}'),
  ('00000000-0000-0000-0000-0000000000b1', 'bruno@exemple.fr',  '{"residence_id": "00000000-0000-0000-0000-0000000000b0"}'),
  ('00000000-0000-0000-0000-0000000000c1', 'nina@exemple.fr',   '{}'),
  ('00000000-0000-0000-0000-0000000000b2', 'zoe@exemple.fr',    '{"residence_id": "00000000-0000-0000-0000-0000000000b0"}');

insert into public.profiles (id, user_id, civility, last_name, location, residence_id, photo_path) values
  ('00000000-0000-0000-0000-000000000a11', '00000000-0000-0000-0000-0000000000a1', 'Madame',   'Alice',  'A-1a', '00000000-0000-0000-0000-0000000000a0', '00000000-0000-0000-0000-0000000000a1/avatar.jpg'),
  ('00000000-0000-0000-0000-000000000a12', '00000000-0000-0000-0000-0000000000a2', 'Monsieur', 'Arthur', 'A-2b', '00000000-0000-0000-0000-0000000000a0', null),
  ('00000000-0000-0000-0000-000000000b11', '00000000-0000-0000-0000-0000000000b1', 'Monsieur', 'Bruno',  'B-1a', '00000000-0000-0000-0000-0000000000b0', '00000000-0000-0000-0000-0000000000b1/avatar.jpg'),
  ('00000000-0000-0000-0000-000000000c11', '00000000-0000-0000-0000-0000000000c1', 'Madame',   'Nina',   'C-1a', null, null);

insert into public.items (id, owner_id, title, condition, photos) values
  ('00000000-0000-0000-0000-000000000a21', '00000000-0000-0000-0000-000000000a11', 'Perceuse', 'Bon état',
   '[{"path": "00000000-0000-0000-0000-0000000000a1/items/00000000-0000-0000-0000-000000000a21/0.jpg"}]'),
  ('00000000-0000-0000-0000-000000000b21', '00000000-0000-0000-0000-000000000b11', 'Échelle', 'Neuf', '[]');

insert into public.borrow_requests (id, item_id, borrower_id) values
  ('00000000-0000-0000-0000-000000000a31', '00000000-0000-0000-0000-000000000a21', '00000000-0000-0000-0000-000000000a12');

insert into public.wanted_requests (id, author_id, text) values
  ('00000000-0000-0000-0000-000000000a41', '00000000-0000-0000-0000-000000000a11', 'Je cherche un escabeau'),
  ('00000000-0000-0000-0000-000000000b41', '00000000-0000-0000-0000-000000000b11', 'Je cherche une scie');

insert into public.help_messages (profile_id, topic, message, reply_email) values
  ('00000000-0000-0000-0000-000000000a11', 'Autre question', 'Bonjour', 'alice@exemple.fr');

insert into storage.objects (bucket_id, name, owner) values
  ('photos', '00000000-0000-0000-0000-0000000000a1/avatar.jpg', '00000000-0000-0000-0000-0000000000a1'),
  ('photos', '00000000-0000-0000-0000-0000000000a1/items/00000000-0000-0000-0000-000000000a21/0.jpg', '00000000-0000-0000-0000-0000000000a1'),
  ('photos', '00000000-0000-0000-0000-0000000000b1/avatar.jpg', '00000000-0000-0000-0000-0000000000b1');


-- Bruno (B) looks at residence A -------------------------------------------------
\o /dev/null
select test.login('bruno');
set role authenticated;

select test.rows('voit son propre profil', $$select 1 from public.profiles$$, 1);
select test.rows('ne voit aucun profil de A', $$select 1 from public.profiles where residence_id = '00000000-0000-0000-0000-0000000000a0'$$, 0);
select test.refused('ne lit pas les e-mails des profils', $$select email from public.profiles$$);
select test.rows('voit seulement sa résidence', $$select 1 from public.residences$$, 1);
select test.rows('ne voit pas la résidence A', $$select 1 from public.residences where id = '00000000-0000-0000-0000-0000000000a0'$$, 0);
select test.rows('voit son objet, pas ceux de A', $$select 1 from public.items$$, 1);
select test.rows('ne voit pas la perceuse d''Alice', $$select 1 from public.items where id = '00000000-0000-0000-0000-000000000a21'$$, 0);
select test.rows('ne voit pas les demandes d''emprunt de A', $$select 1 from public.borrow_requests$$, 0);
select test.rows('voit son « Je cherche », pas ceux de A', $$select 1 from public.wanted_requests$$, 1);
select test.refused('ne lit pas les messages d''Aide', $$select 1 from public.help_messages$$);
select test.refused('ne lit pas les demandes de résidence', $$select 1 from public.residence_requests$$);
select test.rows('voit ses photos, pas celles de A', $$select 1 from storage.objects$$, 1);
select test.rows('ne voit pas les photos d''Alice', $$select 1 from storage.objects where name like '00000000-0000-0000-0000-0000000000a1/%'$$, 0);

select test.rows('ne modifie pas le profil d''Alice', $$update public.profiles set last_name = 'Pirate' where id = '00000000-0000-0000-0000-000000000a11'$$, 0);
select test.refused('ne supprime pas le profil d''Alice', $$delete from public.profiles where id = '00000000-0000-0000-0000-000000000a11'$$);
select test.rows('ne modifie pas la perceuse d''Alice', $$update public.items set status = 'removed' where id = '00000000-0000-0000-0000-000000000a21'$$, 0);
select test.rows('ne supprime pas la perceuse d''Alice', $$delete from public.items where id = '00000000-0000-0000-0000-000000000a21'$$, 0);
select test.refused('ne crée pas d''objet au nom d''Alice', $$insert into public.items (owner_id, title, condition) values ('00000000-0000-0000-0000-000000000a11', 'Faux', 'Neuf')$$);
select test.refused('ne demande pas à emprunter la perceuse d''Alice', $$insert into public.borrow_requests (item_id, borrower_id) values ('00000000-0000-0000-0000-000000000a21', '00000000-0000-0000-0000-000000000b11')$$);
select test.refused('ne demande pas d''emprunt au nom d''Arthur', $$insert into public.borrow_requests (item_id, borrower_id) values ('00000000-0000-0000-0000-000000000b21', '00000000-0000-0000-0000-000000000a12')$$);
select test.rows('ne répond pas à une demande d''emprunt de A', $$update public.borrow_requests set status = 'approved' where id = '00000000-0000-0000-0000-000000000a31'$$, 0);
select test.rows('ne supprime pas une demande d''emprunt de A', $$delete from public.borrow_requests where id = '00000000-0000-0000-0000-000000000a31'$$, 0);
select test.rows('ne modifie pas le « Je cherche » d''Alice', $$update public.wanted_requests set text = 'Pirate' where id = '00000000-0000-0000-0000-000000000a41'$$, 0);
select test.rows('ne supprime pas le « Je cherche » d''Alice', $$delete from public.wanted_requests where id = '00000000-0000-0000-0000-000000000a41'$$, 0);
select test.refused('ne publie pas de « Je cherche » au nom d''Alice', $$insert into public.wanted_requests (author_id, text) values ('00000000-0000-0000-0000-000000000a11', 'Faux')$$);
select test.refused('n''écrit pas à l''Aide au nom d''Alice', $$insert into public.help_messages (profile_id, topic, message, reply_email) values ('00000000-0000-0000-0000-000000000a11', 'Autre question', 'Faux', 'bruno@exemple.fr')$$);
select test.refused('ne dépose pas de photo de profil chez Alice', $$insert into storage.objects (bucket_id, name) values ('photos', '00000000-0000-0000-0000-0000000000a1/avatar.jpg')$$);
select test.refused('ne dépose pas de photo d''objet chez Alice', $$insert into storage.objects (bucket_id, name) values ('photos', '00000000-0000-0000-0000-0000000000a1/items/00000000-0000-0000-0000-000000000a21/1.jpg')$$);
select test.rows('ne remplace pas la photo d''Alice', $$update storage.objects set name = name where name = '00000000-0000-0000-0000-0000000000a1/avatar.jpg'$$, 0);
select test.rows('ne supprime pas la photo d''Alice', $$delete from storage.objects where name = '00000000-0000-0000-0000-0000000000a1/avatar.jpg'$$, 0);

select test.refused('ne change pas sa résidence', $$update public.profiles set residence_id = '00000000-0000-0000-0000-0000000000a0' where id = '00000000-0000-0000-0000-000000000b11'$$);
select test.refused('ne change pas sa date d''admission', $$update public.profiles set admitted_on = '2000-01-01' where id = '00000000-0000-0000-0000-000000000b11'$$);
select test.refused('ne prend pas le compte d''Alice', $$update public.profiles set user_id = '00000000-0000-0000-0000-0000000000a1' where id = '00000000-0000-0000-0000-000000000b11'$$);
select test.refused('ne se rattache pas lui-même à A', $$select private.add_to_residence('00000000-0000-0000-0000-0000000000a0', array['bruno@exemple.fr'])$$);
select test.refused('ne lit pas les comptes de connexion', $$select 1 from auth.users$$);

-- Controls: what Bruno is allowed to do still works.
select test.rows('modifie son propre profil', $$update public.profiles set last_name = 'Brun' where id = '00000000-0000-0000-0000-000000000b11'$$, 1);
select test.rows('publie un « Je cherche »', $$insert into public.wanted_requests (author_id, text) values ('00000000-0000-0000-0000-000000000b11', 'Je cherche un marteau')$$, 1);
select test.rows('ajoute un objet', $$insert into public.items (owner_id, title, condition) values ('00000000-0000-0000-0000-000000000b11', 'Scie', 'Neuf')$$, 1);
select test.rows('dépose une photo d''objet chez lui', $$insert into storage.objects (bucket_id, name) values ('photos', '00000000-0000-0000-0000-0000000000b1/items/00000000-0000-0000-0000-000000000b21/0.jpg')$$, 1);


-- Arthur (A) and Alice's things: same residence, but not his ----------------------
reset role;
select test.login('arthur');
set role authenticated;

select test.rows('voit les deux profils de A', $$select 1 from public.profiles$$, 2);
select test.rows('voit la perceuse d''Alice', $$select 1 from public.items where id = '00000000-0000-0000-0000-000000000a21'$$, 1);
select test.rows('voit les photos d''Alice', $$select 1 from storage.objects where name like '00000000-0000-0000-0000-0000000000a1/%'$$, 2);
select test.rows('voit sa demande d''emprunt', $$select 1 from public.borrow_requests$$, 1);
select test.rows('ne modifie pas la perceuse d''Alice', $$update public.items set title = 'À moi' where id = '00000000-0000-0000-0000-000000000a21'$$, 0);
select test.rows('ne supprime pas la perceuse d''Alice', $$delete from public.items where id = '00000000-0000-0000-0000-000000000a21'$$, 0);
select test.rows('n''accepte pas sa propre demande', $$update public.borrow_requests set status = 'approved' where id = '00000000-0000-0000-0000-000000000a31'$$, 0);
select test.rows('ne modifie pas le profil d''Alice', $$update public.profiles set location = 'A-9z' where id = '00000000-0000-0000-0000-000000000a11'$$, 0);
select test.rows('ne remplace pas la photo d''Alice', $$update storage.objects set name = name where name = '00000000-0000-0000-0000-0000000000a1/avatar.jpg'$$, 0);
select test.rows('ne supprime pas la photo d''Alice', $$delete from storage.objects where name = '00000000-0000-0000-0000-0000000000a1/avatar.jpg'$$, 0);
select test.refused('ne dépose pas de photo chez Alice', $$insert into storage.objects (bucket_id, name) values ('photos', '00000000-0000-0000-0000-0000000000a1/avatar.jpg')$$);
select test.rows('annule sa demande en attente', $$delete from public.borrow_requests where id = '00000000-0000-0000-0000-000000000a31'$$, 1);


-- Alice answers Arthur's request --------------------------------------------------
reset role;
select test.login('alice');
set role authenticated;

select test.rows('accepte la demande d''Arthur', $$update public.borrow_requests set status = 'approved' where id = '00000000-0000-0000-0000-000000000a31'$$, 1);
select test.refused('ne change pas l''emprunteur', $$update public.borrow_requests set borrower_id = '00000000-0000-0000-0000-000000000a11' where id = '00000000-0000-0000-0000-000000000a31'$$);
select test.refused('ne change pas l''objet demandé', $$update public.borrow_requests set item_id = '00000000-0000-0000-0000-000000000b21' where id = '00000000-0000-0000-0000-000000000a31'$$);
select test.refused('ne demande pas l''échelle de Bruno (B)', $$insert into public.borrow_requests (item_id, borrower_id) values ('00000000-0000-0000-0000-000000000b21', '00000000-0000-0000-0000-000000000a11')$$);


-- Nina: a profile but no residence yet -------------------------------------------
reset role;
select test.login('nina');
set role authenticated;

select test.rows('voit seulement son profil', $$select 1 from public.profiles$$, 1);
select test.rows('ne voit aucune résidence', $$select 1 from public.residences$$, 0);
select test.rows('ne voit aucun objet', $$select 1 from public.items$$, 0);
select test.rows('ne voit aucun « Je cherche »', $$select 1 from public.wanted_requests$$, 0);
select test.rows('ne voit aucune photo', $$select 1 from storage.objects$$, 0);
select test.refused('n''ajoute pas d''objet', $$insert into public.items (owner_id, title, condition) values ('00000000-0000-0000-0000-000000000c11', 'Vélo', 'Neuf')$$);
select test.refused('ne publie pas de « Je cherche »', $$insert into public.wanted_requests (author_id, text) values ('00000000-0000-0000-0000-000000000c11', 'Je cherche un vélo')$$);
select test.refused('ne dépose pas de photo d''objet', $$insert into storage.objects (bucket_id, name) values ('photos', '00000000-0000-0000-0000-0000000000c1/items/00000000-0000-0000-0000-000000000c21/0.jpg')$$);
select test.rows('dépose sa photo de profil', $$insert into storage.objects (bucket_id, name) values ('photos', '00000000-0000-0000-0000-0000000000c1/avatar.jpg')$$, 1);


-- Zoe: invited to B, creates her profile ------------------------------------------
reset role;
select test.login('zoe');
set role authenticated;

select test.rows('crée son profil, rattaché à B', $$with p as (insert into public.profiles (user_id, civility, last_name, location) values ('00000000-0000-0000-0000-0000000000b2', 'Madame', 'Zoé', 'B-2a') returning residence_id) select 1 from p where residence_id = '00000000-0000-0000-0000-0000000000b0'$$, 1);
select test.refused('ne crée pas son profil dans A', $$insert into public.profiles (user_id, civility, last_name, location, residence_id) values ('00000000-0000-0000-0000-0000000000b2', 'Madame', 'Zoé', 'B-2a', '00000000-0000-0000-0000-0000000000a0')$$);
select test.refused('ne crée pas de profil pour quelqu''un d''autre', $$insert into public.profiles (user_id, civility, last_name, location) values ('00000000-0000-0000-0000-0000000000a2', 'Madame', 'Zoé', 'B-2a')$$);


-- Visitor not signed in ------------------------------------------------------------
reset role;
select test.login('personne');
set role anon;

select test.refused('visiteur : ne lit pas les profils', $$select 1 from public.profiles$$);
select test.refused('visiteur : ne lit pas les objets', $$select 1 from public.items$$);
select test.refused('visiteur : ne lit pas les résidences', $$select 1 from public.residences$$);
select test.refused('visiteur : ne lit pas les demandes d''emprunt', $$select 1 from public.borrow_requests$$);
select test.refused('visiteur : ne lit pas les « Je cherche »', $$select 1 from public.wanted_requests$$);
select test.rows('visiteur : ne voit aucune photo', $$select 1 from storage.objects$$, 0);
select test.refused('visiteur : ne dépose pas de photo', $$insert into storage.objects (bucket_id, name) values ('photos', '00000000-0000-0000-0000-0000000000a1/avatar.jpg')$$);
select test.rows('visiteur : demande Voisin pour sa résidence', $$insert into public.residence_requests (contact_name, email, address) values ('Paul', 'paul@exemple.fr', '3 rue C')$$, 1);


-- Report ---------------------------------------------------------------------------
reset role;
\o
\pset footer off
\pset border 1
select who as "voisin", label as "contrôle", case when ok then 'ok' else 'ÉCHEC' end as "résultat", detail as "détail"
from test.results order by n;

do $$
declare failed int := (select count(*) from test.results where not ok);
        total int := (select count(*) from test.results);
begin
  if failed > 0 then
    raise exception '% contrôle(s) sur % en échec', failed, total;
  end if;
  raise notice 'Isolation entre résidences : % contrôles, tous réussis.', total;
end;
$$;

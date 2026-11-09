#!/usr/bin/env bash
# Isolation test between residences (plan 8.6).
#
# Builds a throwaway database "voisin_test" on a plain Postgres (16 or later),
# adds a minimal copy of the Supabase platform (supabase-stub.sql), applies
# every file of supabase/migrations/ in order, then runs isolation.sql.
# Never point it at the Supabase project: it drops and recreates voisin_test.
#
# Connection: the usual PG* variables, e.g.
#   PGHOST=localhost PGUSER=postgres PGPASSWORD=postgres pnpm test:db
set -euo pipefail

here="$(cd "$(dirname "$0")" && pwd)"
migrations="$here/../migrations"
db=voisin_test

psql -X -q -v ON_ERROR_STOP=1 -d postgres \
  -c "drop database if exists $db" \
  -c "create database $db"

{
  echo '\set ON_ERROR_STOP 1'
  echo 'set client_min_messages = warning;'
  cat "$here/supabase-stub.sql"
  for f in "$migrations"/*.sql; do
    echo "\\echo migration $(basename "$f")"
    # pg_net is a Supabase extension; the stub provides net.http_post instead.
    sed -E 's/^([[:space:]]*(create|drop) extension[^;]*pg_net[^;]*;)/-- (test) \1/I' "$f"
  done
  echo 'set client_min_messages = notice;'
  cat "$here/isolation.sql"
} | psql -X -q -d "$db"

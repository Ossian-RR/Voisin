# Technical Design

## Stack

| Layer    | Choice                                       | Why                                               |
| -------- | -------------------------------------------- | ------------------------------------------------- |
| UI       | React 18, TypeScript                         | Already set up in this project                    |
| Routing  | React Router 6 (SPA mode)                    | Nested routes let one layout wrap every page      |
| Styling  | Tailwind CSS 3 config with HSL CSS variables | Design tokens in one place                        |
| Build    | Vite                                         | Fast dev server with hot reload                   |
| Server   | Express, inside the Vite dev server          | Holds secrets and database access                 |
| Database | Neon Postgres                                | Serverless Postgres, free tier for small projects |
| Tests    | Vitest                                       | Same tool as Vite, no extra config                |
| Icons    | Lucide React                                 | Consistent stroke icons                           |

Keep to the current stack. Do not add a second UI library or state manager for the first version.

## Folder layout

```
client/
  App.tsx                       # Routes, wrapped by AppLayout
  global.css                    # Design tokens (HSL channels) and safe-area utilities
  components/
    layout/AppLayout.tsx        # Header, bottom tab bar, Outlet
    items/ItemCard.tsx          # Grid card
    items/ItemImage.tsx         # Photo placeholder until uploads exist
    items/StatusBadge.tsx       # available / unavailable / removed
  pages/
    Index.tsx                   # Home
    ItemDetail.tsx              # /items/:id
    Placeholder.tsx             # Reused for unbuilt routes
    NotFound.tsx
server/
  index.ts                      # Express routes (API added in phase 4)
shared/
  api.ts                        # Shared types: Item, ItemStatus, FoodRequest, BorrowRequest
  mock.ts                       # Sample data and pure helpers used by the UI
docs/                           # This plan
```

Path aliases: `@/` points to `client/`, `@shared/` points to `shared/`.

## Data model (Neon Postgres)

```sql
create type item_status as enum ('available', 'unavailable', 'removed');
create type borrow_status as enum ('pending', 'approved', 'declined', 'returned');

create table users (
  id           uuid primary key default gen_random_uuid(),
  first_name   text not null,
  email        text unique not null,
  created_at   timestamptz not null default now()
);

create table items (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid not null references users(id),
  title        text not null check (char_length(title) between 3 and 60),
  description  text not null default '',
  category     text not null,
  condition    text not null default '',
  status       item_status not null default 'available',
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table item_photos (
  id           uuid primary key default gen_random_uuid(),
  item_id      uuid not null references items(id) on delete cascade,
  storage_key  text not null,
  position     int not null default 0
);

create table borrow_requests (
  id              uuid primary key default gen_random_uuid(),
  item_id         uuid not null references items(id) on delete cascade,
  borrower_id     uuid not null references users(id),
  status          borrow_status not null default 'pending',
  requested_from  date not null,
  requested_until date not null,
  created_at      timestamptz not null default now()
);

create table food_requests (
  id           uuid primary key default gen_random_uuid(),
  requester_id uuid not null references users(id),
  title        text not null,
  note         text not null default '',
  needed_by    timestamptz not null,
  fulfilled    boolean not null default false,
  created_at   timestamptz not null default now()
);
```

Rules:

- Deleting an item sets `status = 'removed'`. Rows are never hard-deleted, so the owner can still see history.
- Approving a borrow request sets the item to `unavailable`. Marking it returned sets it back to `available`.
- Prices or payment columns are not added. The app is non-commercial.

## API (kept small)

| Method | Path                             | Purpose                                |
| ------ | -------------------------------- | -------------------------------------- |
| GET    | `/api/items`                     | Visible items (excludes `removed`)     |
| GET    | `/api/items/:id`                 | One item with photos                   |
| POST   | `/api/items`                     | Owner posts a new item                 |
| DELETE | `/api/items/:id`                 | Owner removes an item (sets `removed`) |
| POST   | `/api/items/:id/borrow-requests` | Borrower asks to borrow                |
| GET    | `/api/food-requests`             | Open food requests                     |

Add these only in phase 4. Until then the UI reads `shared/mock.ts`. Each route lives in `server/routes/` and is registered in `server/index.ts`.

## Authentication

- Neighbors sign in with an email magic link, so no passwords are stored.
- Use a managed auth option that works with Neon (for example Neon Auth or Better Auth) rather than writing your own.
- Only the owner can delete an item. Check `owner_id` on the server, never trust the client.
- Show only a first name and neighborhood to other users. Keep full addresses off the app.

## Neon setup steps

1. Create a Neon account and a project named `common-shed`.
2. Copy the connection string. Store it as a secret named `DATABASE_URL`, never in code or in `.env` committed to git.
3. Run the schema above in the Neon SQL editor, or with a migration file under `server/db/`.
4. Add the connection to the server only. Import `DATABASE_URL` from `process.env` in `server/`.
5. Seed the table with the sample rows from `shared/mock.ts` so the UI can be checked against real data.

## Photos

- Store photos in object storage (for example Cloudflare R2 or Neon-compatible blob storage). Keep only the `storage_key` in the database.
- Resize on upload to about 1200 px on the long side and compress to JPEG. Phones produce very large images.
- Show the placeholder from `ItemImage` when an item has no photo yet.

## Progressive web app

- Add a `manifest.webmanifest` with the name, theme color `#f9f5ee`, and icons.
- Use `display: standalone` so the app opens without browser bars.
- Service workers and offline caching come after the core flows work.

## Performance and accessibility

- Keep the first screen under 200 KB of JavaScript. Check with `pnpm build` and the file sizes it prints.
- Lazy-load pages with `React.lazy` once there are more than five.
- Every icon-only button needs an `aria-label`. Text contrast must pass WCAG AA.
- Respect `prefers-reduced-motion` for carousel and card transitions.

## Commands

```bash
pnpm dev         # Start the dev server on port 8080
pnpm typecheck   # TypeScript checks
pnpm test        # Vitest unit tests
pnpm build       # Production build
pnpm build:pages # Static build for GitHub Pages (served under /Voisin/)
```

## Claude on GitHub (review and log analysis)

Three workflows use the official [Claude Code GitHub Action](https://github.com/anthropics/claude-code-action) (`anthropics/claude-code-action@v1`):

| Workflow                                                | When                                       | What Claude does                                                                                                                                             |
| ------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `claude-review.yml` "Relecture Claude"                  | Every pull request (not drafts, not forks) | Runs the official **code-review** skill (plugin `code-review@claude-code-plugins` from github.com/anthropics/claude-code) and comments bugs on the PR lines. |
| `claude-ci-failure.yml` "Analyse des échecs par Claude" | "Publier la maquette" fails                | Reads the failed run's log and opens an issue: failing step, likely cause, fix.                                                                              |
| `claude.yml` "Claude (@claude)"                         | A comment containing `@claude`             | Answers in the thread (question, bug, log to explain). Only people with write access can trigger it.                                                         |

Project rules for the reviewer live in `CLAUDE.md` (French UI text, `X-Nn` flats, local storage, mobile width, tests in `shared/`).

**One-time setup (repo owner):**

1. Install the Claude GitHub App on this repo only: https://github.com/apps/claude → Install → "Only select repositories" → Voisin.
2. Create **one** key:
   - API key (pay per use): https://console.anthropic.com → API Keys → Create Key. Secret name: `ANTHROPIC_API_KEY`.
   - Or a Claude Pro/Max subscription token: install Claude Code CLI, run `claude setup-token`. Secret name: `CLAUDE_CODE_OAUTH_TOKEN`.
3. Add it to the repo: Settings → Secrets and variables → Actions → New repository secret (or `gh secret set ANTHROPIC_API_KEY` and paste when asked). Never commit the key.
4. Test: open a pull request (review starts by itself) or comment `@claude explique ce que fait ce fichier` on a PR.

Costs: each run uses tokens from the key or the subscription, plus GitHub Actions minutes (free on public repos). Runs time out after 15–20 minutes.

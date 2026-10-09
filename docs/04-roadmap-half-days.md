# Roadmap in Half-Day Segments

Each segment is a half day (about 3 to 4 focused hours). Each one has a goal, tasks, tools, and a "done when" check. Do not start the next segment until the check passes.

Status markers: **[done]** means the first pass is already in the codebase.

---

## Phase 0: Setup (1 day)

### 0.1 Set up tools and read the project [done in first pass]
- **Goal:** Run the app and understand where things live.
- **Tasks:** Install Node 20 or newer and pnpm. Run `pnpm install` and `pnpm dev`. Open the preview. Read `AGENTS.md` and `docs/03-technical.md`.
- **Tools:** Terminal, VS Code, browser.
- **Done when:** The home page loads at `localhost:8080` and you can name the folders `client/`, `server/`, and `shared/`.

### 0.2 Plan the repository [done in first pass]
- **Goal:** Make the repo ready for steady work.
- **Tasks:** Confirm `docs/` holds the six plan files. The platform saves a commit for each change, so review the history after each segment.
- **Tools:** Git.
- **Done when:** `git log` shows a commit for the docs and the working tree is clean.

---

## Phase 1: Design (1.5 days)

### 1.1 Brand and palette [done in first pass]
- **Goal:** Lock the name, colors, and fonts.
- **Tasks:** Confirm the name "Common Shed" with the neighbors who will use it. Check each color pair in `01-design.md` with a contrast checker. Change HSL values in `client/global.css` only.
- **Tools:** WebAIM contrast checker, Google Fonts.
- **Done when:** Body text and button text both pass WCAG AA contrast.

### 1.2 Sketch the screens at 360 x 800
- **Goal:** Agree on the layout of the home page, item detail, and tab bar.
- **Tasks:** Sketch on paper or in Figma: home, detail, placeholder. Mark the header, tab bar, and safe-area zones.
- **Tools:** Paper, Figma, or a napkin.
- **Done when:** Each screen has a sketch with the safe areas marked.

### 1.3 Tokens, fonts, and safe areas [done in first pass]
- **Goal:** Wire the design into code.
- **Tasks:** Confirm `index.html` has `viewport-fit=cover` and the two fonts. Confirm `global.css` values are HSL channels. Confirm `tailwind.config.ts` wraps them as `hsl(var(--name))`.
- **Tools:** VS Code, the preview.
- **Done when:** Changing `--primary` in `global.css` changes every primary button.

---

## Phase 2: Shell and mock data (1.5 days)

### 2.1 Shared types and mock data [done in first pass]
- **Goal:** Give the UI real-looking data before the database exists.
- **Tasks:** Define `Item`, `ItemStatus`, `FoodRequest`, `BorrowRequest` in `shared/api.ts`. Add sample items and food requests in `shared/mock.ts`. Write `visibleItems` and `findItem`.
- **Tools:** TypeScript.
- **Done when:** `pnpm typecheck` passes and removed items are excluded by `visibleItems`.

### 2.2 Shared layout [done in first pass]
- **Goal:** One header and one tab bar for every page.
- **Tasks:** Build `AppLayout.tsx` with header, `Outlet`, and five tabs (Items, Food, Add, Requests, Profile). Put the Add button in the middle. Wire it in `App.tsx` with nested routes.
- **Tools:** React Router `NavLink`, `Outlet`.
- **Done when:** Every route shows the header and tab bar, and the active tab is highlighted.

### 2.3 Placeholder and 404 pages [done in first pass]
- **Goal:** No dead links.
- **Tasks:** Build `Placeholder.tsx` with a title prop. Route `/food`, `/add`, `/requests`, `/profile` to it. Restyle `NotFound.tsx` with `Link`.
- **Tools:** React Router.
- **Done when:** Each tab opens a page inside the layout, and an unknown URL shows the 404 inside the layout.

---

## Phase 3: Browse and detail (1.5 days)

### 3.1 Home listings [done in first pass]
- **Goal:** Two-column grid with search and category filters.
- **Tasks:** Build `ItemCard` and `StatusBadge`. Add search and chips in `Index.tsx`. Check at 360, 375, and 430 widths.
- **Tools:** Tailwind grid, browser devtools device mode.
- **Done when:** Filters update the grid and the count, and no card overflows the column.

### 3.2 Item detail with carousel [done in first pass]
- **Goal:** Photos, details, and the borrow button.
- **Tasks:** Build the scroll-snap carousel, counter, and dots. Add the status panel and the sticky CTA. Handle unknown ids.
- **Tools:** CSS scroll snap, React state.
- **Done when:** Swiping updates the dots, an unavailable item disables the CTA, and an unknown id shows "Item not found".

### 3.3 Safe-area and fluid pass
- **Goal:** Confirm the layout behaves on real phones.
- **Tasks:** Test in the browser at 360, 375, and 430 widths. Check the CTA stays above the tab bar. Check no horizontal scrollbar appears on any page.
- **Tools:** Browser devtools, iPhone and Android devices if available.
- **Done when:** Every page passes the checks in `05-testing.md`.

---

## Phase 4: Data and API (2 days)

### 4.1 Neon database and schema
- **Goal:** A real database with the tables from `03-technical.md`.
- **Tasks:** Create the Neon project. Store `DATABASE_URL` as a secret. Run the schema. Seed sample rows.
- **Tools:** Neon console, SQL editor.
- **Done when:** A `select count(*) from items` returns the seeded rows.

### 4.2 Read endpoints
- **Goal:** `GET /api/items` and `GET /api/items/:id` return data from Neon.
- **Tasks:** Add `server/routes/items.ts`. Register it in `server/index.ts`. Replace the mock import in `Index.tsx` with a fetch, keeping the same types.
- **Tools:** Express, Zod for input checks.
- **Done when:** The home page shows database rows and `removed` rows are missing.

### 4.3 Write endpoints
- **Goal:** Owners can post and remove items.
- **Tasks:** Add `POST /api/items` and `DELETE /api/items/:id`. Validate input with Zod. Check `owner_id` on delete.
- **Tools:** Zod, Express.
- **Done when:** Posting an item shows it in the list, and deleting it hides it.

### 4.4 Borrow and food endpoints
- **Goal:** Borrow requests and food requests are saved.
- **Tasks:** Add `POST /api/items/:id/borrow-requests` and `GET /api/food-requests`. Approving a borrow sets the item to `unavailable`.
- **Tools:** Express, Neon.
- **Done when:** A request appears in the database and the item status updates.

---

## Phase 5: Accounts and trust (1 day)

### 5.1 Sign-in with magic link
- **Goal:** Neighbors sign in without passwords.
- **Tasks:** Pick a managed auth option that works with Neon. Add a sign-in page. Store only the user's first name and email.
- **Tools:** Neon Auth or Better Auth, email provider.
- **Done when:** A test user can sign in from a phone and sign out.

### 5.2 Ownership and privacy checks
- **Goal:** Only owners change their items.
- **Tasks:** Enforce `owner_id` on delete. Show only first names. Add a report link to a placeholder page.
- **Tools:** Express middleware.
- **Done when:** A second test account cannot delete the first account's item (the server returns 403).

---

## Phase 6: Owner and borrower flows (1.5 days)

### 6.1 Share an item form
- **Goal:** Post an item with a photo, title, category, description, and condition.
- **Tasks:** Build the form on `/add`. Check title length and required fields. Show validation messages next to the field.
- **Tools:** Native form controls, Zod.
- **Done when:** A posted item appears on the owner's profile with its photo and title.

### 6.2 Photo upload
- **Goal:** Real photos replace the placeholder.
- **Tasks:** Use `<input type="file" accept="image/*">`. Resize in the browser before upload. Save the key in `item_photos`.
- **Tools:** Object storage, browser canvas.
- **Done when:** An uploaded photo shows on the card and in the carousel.

### 6.3 Borrow flow and status changes
- **Goal:** Ask, approve, return.
- **Tasks:** Wire "Ask to borrow" to the borrow endpoint. Owners approve or decline on `/requests`. Approving marks the item unavailable. Returning marks it available.
- **Tools:** React Query or fetch.
- **Done when:** A full loop works: ask, approve, item shows unavailable, return, item shows available.

---

## Phase 7: Food corner (0.5 day)

### 7.1 Food requests
- **Goal:** Neighbors post and see basic food requests.
- **Tasks:** Build `/food` with the list and a simple form (item, note, needed by). Show the three newest on the home page strip.
- **Tools:** Same endpoints as phase 4.
- **Done when:** A posted request appears on home and on the Food page, and it can be marked fulfilled.

---

## Phase 8: Testing and polish (1.5 days)

### 8.1 Unit tests
- **Goal:** Lock down the logic that is easy to break.
- **Tasks:** Test `visibleItems`, `findItem`, status mapping, and the Zod schemas. Run `pnpm test`.
- **Tools:** Vitest.
- **Done when:** All tests pass and each helper has a test for a removed item.

### 8.2 Device and width checks
- **Goal:** Pass the manual checklist in `05-testing.md`.
- **Tasks:** Run through the checklist at 360 x 800, 375, and 430. Note each failure with a screenshot.
- **Tools:** Browser devtools, real phone.
- **Done when:** Every checklist item is ticked.

### 8.3 Accessibility pass
- **Goal:** Usable with a screen reader and by keyboard.
- **Tasks:** Check labels, focus rings, and heading order. Confirm all icon buttons have labels.
- **Tools:** Browser accessibility panel, VoiceOver or TalkBack.
- **Done when:** A screen reader can read the home page and buy-flow without guessing.

---

## Phase 9: Pilot and launch (1 day)

### 9.1 Build and deploy
- **Goal:** A production URL the neighbors can open.
- **Tasks:** Run `pnpm build`. Add the environment variables to the host. Deploy with Netlify or Vercel. Add the manifest and icons.
- **Tools:** Netlify or Vercel, `pnpm build`.
- **Done when:** The production URL loads on a phone and the home page shows live data.

### 9.2 Pilot with neighbors
- **Goal:** Find the problems that only real use shows.
- **Tasks:** Invite five to ten neighbors. Ask them to share one item and borrow one. Collect feedback in a shared note. Fix the top three issues.
- **Tools:** Messaging group, feedback doc.
- **Done when:** Each pilot neighbor completes one share and one borrow, and the top three issues are closed.

---

## Total

About 26 half-day segments, which is roughly 13 working days for one builder, plus pilot time.

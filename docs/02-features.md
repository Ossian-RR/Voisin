# Features

All user-facing text is in French. Flat references follow `X-Nn`: X = building part or tower (capital letter), N = floor number, n = door letter (see `shared/location.ts`).

Each feature lists user stories and acceptance criteria (AC). A feature is done only when every AC passes at 360, 375, and 430 widths.

## 1. Item listings (home)

**Story:** As a neighbor, I want to see items shared nearby so I can find what I need.

- AC1: The home page opens straight on search, category chips and a two-column grid (no header, hero or section title). Each card shows the item photo, title, status badge, the owner's flat reference (`X-Nn`, e.g. `A-3a`) and first name.
- AC2: Items with status `removed` never appear.
- AC3: Typing in search filters items by title or description, without a page reload.
- AC4: Category chips (Tous, Outils, Jardin, Ménage, Cuisine, Extérieur) filter the grid. They wrap onto several lines so every chip is visible, with no horizontal scroll. The active chip is marked with `aria-pressed`.
- AC5: When nothing matches, the page shows a friendly empty message, not a blank area.
- AC6: The item count is announced to screen readers as filters change.

## 2. Item detail

**Story:** As a neighbor, I want to open an item and see more photos and details before I ask to borrow it.

- AC1: Tapping a card photo or title opens `/items/:id`.
- AC2: The page shows a photo carousel with a counter (for example `1 / 3`) and dots. Swiping changes the photo.
- AC3: The page shows status, title, the owner's flat reference and first name, description, and condition. The owner block spells the flat out ("Bâtiment A, 3e étage, porte a").
- AC4: An unknown or removed item id shows "Item not found" with a link back to the list. No blank screen.
- AC5: The "Ask to borrow" button stays reachable above the tab bar while scrolling.
- AC6: When the item is `unavailable`, the button is disabled and the status panel explains when it will be available again.

## 3. Ask to borrow (borrower view)

**Story:** As a borrower, I want to ask an owner to lend me an item and see whether it is free.

- AC1: Borrowers see only `available` or `unavailable` for each item, never the owner's controls.
- AC2: Tapping "Demander à emprunter" on an available item creates a borrow request with status `pending`. The button turns grey, reads "Demande envoyée" and stays disabled while the request is open. A toast confirms the request. (Requests are kept in the browser's local storage until the data phase.)
- AC2b: The Requests tab ("Mes demandes") lists the borrower's requests, newest first, with item, owner, status and date. A pending request can be cancelled, which makes the button active again.
- AC3: When the owner approves, the item becomes `unavailable` for everyone else.
- AC4: When the item is returned, the owner marks it returned and it becomes `available` again.

## 4. Share an item (owner view)

**Story:** As an owner, I want to post an item with a photo and title so neighbors can borrow it.

- AC1: The Add tab opens a form with photo, title, category, description, and condition.
- AC2: A posted item appears on the owner's profile with photo and title.
- AC3: The owner can delete an item. Deleting sets its status to `removed` and removes it from every list.
- AC4: Deleting asks for confirmation first.

## 5. Recherche (wanted items)

**Story:** As a neighbor, I want to tell the residence what I am looking for, even if nobody has posted it yet.

- AC1: The second tab, "Recherche", opens a form headed with the neighbor's civility and family name followed by "recherche" (e.g. "Madame Martin recherche"). Civility is Monsieur, Madame or Famille, taken from the profile.
- AC2: The text field is free: no filter, no placeholder or pre-filled text, no autocomplete, autocorrect or spellcheck. The text is saved exactly as typed (only surrounding spaces are trimmed).
- AC3: Below it, an optional date field labelled "pour la date du" (past dates cannot be picked), then an optional time field labelled "à l’heure suivante :". Cards show both, e.g. "Pour le mardi 20 octobre à 14h30".
- AC4: "Publier ma recherche" is disabled while the text is empty. Publishing confirms with a toast and opens the home page, scrolled to the new search.
- AC5: Published searches appear at the bottom of the home page under "Vos voisins recherchent", newest first. Each card shows who is looking ("Madame Martin recherche"), the text and the wished date. Only the author sees "Retirer". The Recherche tab has no list of its own. (Kept in local storage until the data phase, so only visible in the same browser for now.)

## 6. Shared navigation

- AC1: The home page starts with a one-line header: "Résidence" (always), the residence name when there is one, and the address (`shared/residence.ts`; today: "Résidence · 333 rue des Pyrénées"). Other pages have no header. The tab bar (Objets, Recherche, +, Demandes, Profil) appears on every page.
- AC2: The active tab is highlighted.
- AC3: Every link leads to a built page or to a placeholder page. No link returns a 404.

## Out of scope for the first pass

Accounts and sign-in, photo upload, messaging, notifications, and maps. Each has its own phase in `04-roadmap-half-days.md`.

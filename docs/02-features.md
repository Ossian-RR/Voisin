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
- AC2: The page shows a photo carousel with a counter (for example `1 / 3`) and dots, with no caption on the photo. Swiping changes the photo.
- AC3: The page shows status, title, the owner's flat reference and first name, description, and condition. The owner block spells the flat out ("Bâtiment A, 3e étage, porte a").
- AC4: An unknown or removed item id shows "Item not found" with a link back to the list. No blank screen.
- AC5: The "Ask to borrow" button stays reachable above the tab bar while scrolling.
- AC6: When the item is `unavailable`, it reads **"Emprunté"** (badge) and "Emprunté en ce moment" (panel and disabled button).
- AC7: The condition is always one of two values: "Bon état" or "Neuf".

## 3. Ask to borrow (borrower view)

**Story:** As a borrower, I want to ask an owner to lend me an item and see whether it is free.

- AC1: Borrowers see only `available` or `unavailable` for each item, never the owner's controls.
- AC2: Tapping "Demander à emprunter" on an available item creates a borrow request with status `pending`. The button turns grey, reads "Demande envoyée" and stays disabled while the request is open. A toast confirms the request. (Requests are kept in the browser's local storage until the data phase.)
- AC2b: The Requests tab ("Mes demandes") lists the borrower's requests, newest first, with item, owner, status and date. A pending request can be cancelled, which makes the button active again.
- AC3: When the owner approves, the item becomes `unavailable` for everyone else.
- AC4: When the item is returned, the owner marks it returned and it becomes `available` again.

## 4. Ajouter un objet (+ tab)

**Story:** As a neighbor, I want to post an item to lend, or to give away for good.

- AC1: The "+" tab (far left of the tab bar) opens a page headed "Pour mes voisins, je mets à disposition…" with, in this order: title, description, photos, condition (Bon état or Neuf) and the "Je donne" toggle.
- AC2: "Je donne" is a short pill toggle with no icon or explanation. Off = a loan (returned to the owner). On = a gift: the pill turns orange, "Il ne vous sera pas rendu." appears beside it and the button reads "Publier le don".
- AC3: Photos come from the phone's library, at least 2 and at most 5. Each is shrunk (longest side 720 px, JPEG) and can be removed before publishing.
- AC4: Publishing with missing fields shows one message per field ("Ajoutez au moins 2 photos.", "Ajoutez encore 1 photo.", …).
- AC5: Once published, the item appears first on the home page. Gifts are set apart from loans by an orange "À donner" badge with a gift icon and an orange card border. Their page reads "Donné par …" and the button "Je le veux".
- AC6: On their own item, the owner sees "Retirer cet objet" instead of the request button. Removing asks for confirmation.
- AC7: Items have no category in the form, so they only show under "Tous". Kept in local storage until the data phase; if the browser is out of space, publishing fails with a message instead of losing the item.

## 5. Recherche (wanted items)

**Story:** As a neighbor, I want to tell the residence what I am looking for, even if nobody has posted it yet.

- AC1: The second tab, "Je cherche", opens a form headed with the neighbor's civility and family name followed by "recherche" (e.g. "Madame Martin recherche"). Civility and name come from the Profil page.
- AC2: The text field is free: no filter, no placeholder or pre-filled text, no autocomplete, autocorrect or spellcheck. The text is saved exactly as typed (only surrounding spaces are trimmed).
- AC3: Below it, an optional date field labelled "pour la date du" (past dates cannot be picked), then an optional time labelled "à l’heure suivante :", picked with two dropdowns: hour (07h–22h) and minutes (00, 15, 30 or 45; only 00 at 22h, so nothing after 22:00). It starts at **12h00** by default; choosing "Heure" (empty) removes the time. Cards show both, e.g. "Pour le mardi 20 octobre à 14h30".
- AC4: "Publier ma recherche" is disabled while the text is empty. Publishing confirms with a toast and opens the home page, scrolled to the new search.
- AC5: Published searches appear at the bottom of the home page under "Vos voisins recherchent", newest first. Each card shows who is looking ("Madame Martin recherche"), the text and the wished date. Only the author sees "Retirer". The Recherche tab has no list of its own. (Kept in local storage until the data phase, so only visible in the same browser for now.)

## 7. Profil

**Story:** As a neighbor, I want to say who I am and where I live in the residence, so neighbors know who is asking.

- AC1: The Profil tab shows the neighbor's name ("Madame Martin"), flat reference with its spelled-out form ("B-2c · Bâtiment B, 2e étage, porte c") and the residence line.
- AC2: "Mes informations" shows, on one line, a civility dropdown (Monsieur, Madame, Famille) followed by the family name field, with the "Nom" label above the name field only. There is no separate "Civilité" label. The flat reference is edited below.
- AC2b: Tapping the profile picture opens the phone's photo library (`accept="image/*"`). The picked photo is center-cropped to a 320 px square JPEG and saved right away, with no need for "Enregistrer". "Retirer la photo" brings the initial back. An unreadable file shows an error toast.
- AC3: The flat reference is tidied on save ("a 1B" → "A-1b"). An invalid one shows "Format attendu : bâtiment-étage-porte, par exemple A-3a." and is not saved. An empty name is refused.
- AC4: "Enregistrer" is disabled until something changes. Saving confirms with a toast.
- AC5: The saved civility and name are used on the Recherche tab ("Famille Durand recherche") and on new searches. Searches already published keep the name they were published with.
- AC6: "Mon activité" lists **"Mes objets"**: every item the neighbor makes available (photo, title, Prêt/Don, condition, status badge), each opening its page; when empty, a link to "+". Below it, "Mes recherches" links to the neighbor's searches on the home page. ("Mes demandes" is still reached from an item page after a request.)
- AC7: Kept in local storage until accounts exist. The default profile is Madame Martin, B-2c.

## 6. Shared navigation

- AC1: The home page starts with a one-line header: "Résidence" (always), the residence name when there is one, and the address (`shared/residence.ts`; today: "Résidence · 333 rue des Pyrénées"). The tab bar (+ "Je prête", "J’emprunte", "Je cherche", "Profil") appears on every page. Every other page starts with a one-line title matching its tab ("Je cherche", "Pour mes voisins, je mets à disposition…", "Profil"), also used as the browser tab title. "Mes demandes" has no tab any more; it is reached from Profil › Mon activité.
- AC2: The active tab is highlighted.
- AC3: Every link leads to a built page or to a placeholder page. No link returns a 404.

## Out of scope for the first pass

Accounts and sign-in, photo upload, messaging, notifications, and maps. Each has its own phase in `04-roadmap-half-days.md`.

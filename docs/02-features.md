# Features

Each feature lists user stories and acceptance criteria (AC). A feature is done only when every AC passes at 360, 375, and 430 widths.

## 1. Item listings (home)

**Story:** As a neighbor, I want to see items shared nearby so I can find what I need.

- AC1: The home page shows a grid of two columns with item photo, title, status badge, distance, and owner's first name.
- AC2: Items with status `removed` never appear.
- AC3: Typing in search filters items by title or description, without a page reload.
- AC4: Category chips (All, Tools, Garden, Cleaning, Kitchen, Outdoor) filter the grid. The active chip is clearly marked with `aria-pressed`.
- AC5: When nothing matches, the page shows a friendly empty message, not a blank area.
- AC6: The item count updates as filters change.

## 2. Item detail

**Story:** As a neighbor, I want to open an item and see more photos and details before I ask to borrow it.

- AC1: Tapping a card photo or title opens `/items/:id`.
- AC2: The page shows a photo carousel with a counter (for example `1 / 3`) and dots. Swiping changes the photo.
- AC3: The page shows status, title, distance, owner's first name, description, and condition.
- AC4: An unknown or removed item id shows "Item not found" with a link back to the list. No blank screen.
- AC5: The "Ask to borrow" button stays reachable above the tab bar while scrolling.
- AC6: When the item is `unavailable`, the button is disabled and the status panel explains when it will be available again.

## 3. Ask to borrow (borrower view)

**Story:** As a borrower, I want to ask an owner to lend me an item and see whether it is free.

- AC1: Borrowers see only `available` or `unavailable` for each item, never the owner's controls.
- AC2: Tapping "Ask to borrow" on an available item creates a borrow request with status `pending`. (Planned for the data phase. The first pass only shows the button state.)
- AC3: When the owner approves, the item becomes `unavailable` for everyone else.
- AC4: When the item is returned, the owner marks it returned and it becomes `available` again.

## 4. Share an item (owner view)

**Story:** As an owner, I want to post an item with a photo and title so neighbors can borrow it.

- AC1: The Add tab opens a form with photo, title, category, description, and condition.
- AC2: A posted item appears on the owner's profile with photo and title.
- AC3: The owner can delete an item. Deleting sets its status to `removed` and removes it from every list.
- AC4: Deleting asks for confirmation first.

## 5. Food corner

**Story:** As a neighbor, I want to ask for a few basic food items, like an egg or some butter, and get them from someone nearby.

- AC1: The home page shows the Food corner strip with the three most recent requests.
- AC2: "See all food requests" opens the Food page.
- AC3: Each request shows what is needed, a note, when it is needed, the requester's first name, and distance.
- AC4: Food is free. No prices or payment fields appear anywhere.
- AC5: A request can be marked fulfilled by the person who gave the food.

## 6. Shared navigation

- AC1: The header (brand and location chip) and tab bar (Items, Food, Add, Requests, Profile) appear on every page.
- AC2: The active tab is highlighted.
- AC3: Every link leads to a built page or to a placeholder page. No link returns a 404.

## Out of scope for the first pass

Accounts and sign-in, photo upload, messaging, notifications, and maps. Each has its own phase in `04-roadmap-half-days.md`.

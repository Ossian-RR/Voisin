# Voisin: Overview

Voisin is a non-profit mobile app that helps neighbors on the same residential street share rarely used household items. Nobody buys or sells here. The app exists so a pressure washer sitting in one garage can save a trip to the shop next door.

## Mission

- Reduce waste by sharing things that sit unused most of the year.
- Build trust between neighbors who already live close together.
- Stay free, non-commercial, and free of advertising.

## Who it is for

- **Neighbors** who own occasional-use items (drills, ladders, pressure cleaners, party tables).
- **Neighbors** who need something once and would rather not buy it.
- **Neighbors** looking for something nobody has posted yet, who want to say so to the residence.

The first version targets one residential area. Expanding beyond that is out of scope.

## What the app does

1. **Items list.** Residents browse items shared nearby, each with a photo, title, and status.
2. **Item detail.** Tapping a photo or title opens photos, description, condition, and the owner's first name.
3. **Ask to borrow.** A neighbor sends a borrow request for an available item.
4. **Share an item.** An owner posts an item with a photo and title, and can remove it later.
5. **Recherche.** A neighbor writes freely what they are looking for ("Madame Martin recherche…") and when they need it. The food corner was removed.

## Item statuses

| Status        | Meaning                                                   | Who sees it                           |
| ------------- | --------------------------------------------------------- | ------------------------------------- |
| `available`   | Ready to lend. The Ask to borrow button is active.        | Everyone                              |
| `unavailable` | Currently lent out. Shown as "Unavailable", CTA disabled. | Everyone                              |
| `removed`     | Deleted by the owner. Hidden from every list.             | Owner only, through their own history |

## Glossary

- **Owner / lender:** the neighbor who posts an item.
- **Borrower:** the neighbor who asks to borrow an item.
- **Safe area:** the part of the phone screen not covered by the notch, the status bar, or the home indicator. The app keeps its header and tab bar clear of these areas.
- **Mock data:** sample items in `shared/mock.ts` used until the database is connected.
- **Placeholder page:** a page that exists so no link is broken, but says it is not built yet.
- **PWA:** a web app that can be installed to a phone's home screen.

## Non-goals for now

- Payments, deposits, or any money changing hands.
- Public listings outside the residential area.
- Native app store release (possible later with a wrapper such as Capacitor).

See `01-design.md` for the look and feel and `03-technical.md` for how it is built.

# Design

## Principles

1. **Neighborly, not corporate.** Warm cream backgrounds, rounded corners, plain language.
2. **Obvious status.** Every item shows its status in one glance, using color and a word, never color alone.
3. **One thumb.** The main actions sit near the bottom of the screen, within easy reach.
4. **Calm density.** Two columns of items on a phone, generous spacing, no more than one primary action per screen.

## Brand direction

- **Name:** Common Shed. A shared garden shed is the picture of what the app does.
- **Mark:** a rounded forest-green tile with a shed icon.
- **Accent:** apricot, used for the Add button, location chip, and Food corner. Warm and friendly, never used for errors.
- **Tone:** short sentences. "Ready to lend." "Lent out for now." Avoid jargon.

## Color tokens

Colors are stored in `client/global.css` as HSL channel triplets (for example `163 45% 26%`). `tailwind.config.ts` wraps them as `hsl(var(--name))`, so you never write `hsl()` in components. Use Tailwind classes such as `bg-primary` or `text-muted-foreground`.

| Token                    | Value             | Use                                   |
| ------------------------ | ----------------- | ------------------------------------- |
| `--background`           | `40 33% 97%`      | Page background (warm cream)          |
| `--foreground`           | `165 25% 11%`     | Main text (ink green-black)           |
| `--primary`              | `163 45% 26%`     | Buttons, active tab, logo tile        |
| `--secondary`            | `36 38% 92%`      | Chips, active tab pill                |
| `--muted-foreground`     | `160 7% 40%`      | Secondary text                        |
| `--accent`               | `18 82% 94%`      | Food corner background                |
| `--apricot`              | `16 80% 52%`      | Add button, location icon             |
| `--success` / `-soft`    | `150 45% 30%` / `146 40% 91%` | Available status           |
| `--warning` / `-soft`    | `32 85% 30%` / `40 90% 91%`   | Unavailable status         |
| `--border`               | `36 20% 88%`      | Card and divider lines                |
| `--radius`               | `1rem`            | Base corner radius (cards, buttons)   |

Contrast: body text, primary buttons, warning text, and accent text pass WCAG AA (4.5:1 for text). Apricot is used only for icons and the Add button, which need 3:1. Check any new color pair with a contrast checker before shipping.

## Typography

- **Display:** Bricolage Grotesque, weights 600 to 800. Used for the brand name, headings, and item titles. Set in `font-display`.
- **Body and UI:** Manrope, weights 400 to 800. Used for everything else. Set as the default `font-sans`.
- Both are loaded once in `index.html`.
- Body text is 15 to 16 px. Inputs are 16 px, which stops iOS from zooming when the field is focused.
- Tap targets are at least 44 px high.

## Layout frame

- **Design size:** 360 x 800 CSS pixels. This is the primary frame.
- **Check widths:** 375 and 430 pixels. The layout must look right at all three.
- **Fluid rules:**
  - Use `w-full`, `max-w-[430px]`, and grids with `grid-cols-2`. Avoid fixed pixel widths on containers.
  - Item cards use `aspect-[4/5]` so photos scale with the column.
  - Long titles clamp to two lines with `line-clamp-2`.
- On desktop browsers the app stays in a 430 px column, centered, so it still looks like a phone.

## Safe areas

- `index.html` sets `viewport-fit=cover`, so the page can draw under the notch and home indicator.
- The header uses `safe-top` (`padding-top: env(safe-area-inset-top)`).
- The bottom tab bar uses `safe-bottom` (`padding-bottom: env(safe-area-inset-bottom)`).
- The item detail CTA sits above the tab bar with `bottom-[calc(4.75rem+env(safe-area-inset-bottom))]`.
- Nothing important sits in the top 44 px or the bottom 34 px without padding.

## Component inventory

| Component             | File                                      | Notes                                         |
| --------------------- | ----------------------------------------- | --------------------------------------------- |
| App layout            | `client/components/layout/AppLayout.tsx`  | Header, `Outlet`, bottom tab bar, shared by all routes |
| Status badge          | `client/components/items/StatusBadge.tsx` | Dot and word for `available` and `unavailable` |
| Item card             | `client/components/items/ItemCard.tsx`    | Photo, status, title, distance, owner first name |
| Item photo            | `client/components/items/ItemImage.tsx`   | Placeholder until real photo upload exists    |
| Home page             | `client/pages/Index.tsx`                  | Hero, search, category chips, grid, Food corner |
| Item detail page      | `client/pages/ItemDetail.tsx`             | Carousel, status panel, details, sticky CTA   |
| Placeholder page      | `client/pages/Placeholder.tsx`            | Reused for unbuilt routes                     |

## Rules for new screens

- Put any new screen inside the `AppLayout` route so the header and tab bar stay consistent.
- Reuse `ItemCard` and `StatusBadge` instead of making a second version.
- Test each new screen at 360, 375, and 430 widths before calling it done.

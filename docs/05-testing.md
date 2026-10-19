# Testing

## Automated tests (Vitest)

Run with `pnpm test`. Put tests next to the code as `*.spec.ts` or `*.test.ts`.

What to cover first:

- **Item helpers** in `shared/mock.ts`:
  - `visibleItems` removes items with status `removed`.
  - `findItem` returns `undefined` for an unknown id and for a removed item.
- **Status rules** (once the API exists): approving a borrow sets the item to `unavailable`, returning it sets `available`.
- **Input schemas** (once Zod is used on the server): a title shorter than 3 characters is rejected.

Keep tests fast. A test that needs a browser belongs in the manual checklist below.

Run `pnpm typecheck` before every commit. Types catch many mistakes that tests miss.

## Manual checks at each width

Use browser devtools device mode. Test these widths:

| Width     | Role                                    |
| --------- | --------------------------------------- |
| 360 x 800 | Primary design frame. Check this first. |
| 375       | Common iPhone width. Check it second.   |
| 430       | Large phone width. Check it third.      |

For each width, confirm:

- [ ] No horizontal scrollbar on the home page, item detail, or any placeholder page.
- [ ] Header text and the location chip do not overlap. The chip shortens instead of pushing the brand off screen.
- [ ] Item cards stay in two equal columns with no overflow. Long titles clamp to two lines.
- [ ] Search input text is at least 16 px, so iOS does not zoom.
- [ ] Category chips scroll sideways without a visible scrollbar.
- [ ] The tab bar is fully visible and the Add button is not clipped.
- [ ] On a phone with a notch or home indicator, nothing sits under the status bar or home indicator.
- [ ] The "Ask to borrow" button is reachable while scrolling and does not cover the tab bar.
- [ ] An unavailable item shows the warning panel and a disabled button.
- [ ] Swiping the photo carousel updates the counter and the dots.
- [ ] Tapping a dot scrolls to that photo.
- [ ] `/items/does-not-exist` shows "Item not found" with a working link.
- [ ] Every tab opens a page. No link returns a 404.

## Safe-area checks

- Open the preview on an iPhone with a notch (or use the devtools setting for a notched device).
- The header must sit below the status bar. The tab bar must sit above the home indicator.
- Rotate the device to landscape. Nothing important should be hidden.

## Accessibility basics

- [ ] Every page has one `h1`, and headings do not skip levels.
- [ ] Icon-only buttons have an `aria-label` (for example the Add tab and carousel dots).
- [ ] Focus rings are visible when tabbing with a keyboard.
- [ ] Text contrast passes WCAG AA. Status colors also use a word, not color alone.
- [ ] Reduced motion is respected. Animations are short and can be turned off by the OS setting.

## Performance check

- Run `pnpm build` and note the main JavaScript file size. Aim for under 200 KB gzipped on the first screen.
- Run Lighthouse in Chrome on the production build. Aim for a mobile performance score above 85.

## Pilot checks

Before the pilot, ask one neighbor to complete these tasks on their own phone, with no help:

1. Find a drill.
2. Open its detail page and read the condition.
3. Ask to borrow it.
4. Post an item with a photo.
5. Delete the item.
6. Find a food request for eggs.

Record every point of confusion. Fix the top three before expanding the pilot.

## Bug report template

```
Page:
Width and device:
Steps:
Expected:
Actual:
Screenshot:
```

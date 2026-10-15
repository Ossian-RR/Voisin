/**
 * Hides the opening screen from index.html once the app is ready, after its
 * animation has played (about 2 s from page load; shorter with reduced motion).
 */
const MIN_VISIBLE_MS = 2200;
const REDUCED_MOTION_MS = 600;

export function hideSplash() {
  const splash = document.getElementById("splash");
  if (!splash) return;
  const reduced = window.matchMedia?.(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  const wait = Math.max(
    0,
    (reduced ? REDUCED_MOTION_MS : MIN_VISIBLE_MS) - performance.now(),
  );
  window.setTimeout(() => {
    splash.classList.add("is-hidden");
    window.setTimeout(() => splash.remove(), 400);
  }, wait);
}

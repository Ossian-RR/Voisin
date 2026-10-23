/**
 * Remembers short-lived photo links so the same link is reused across list
 * refreshes: the browser then keeps the image instead of downloading it again.
 * A link is renewed once less than `marginMs` of its life is left.
 */
export function createLinkCache(marginMs: number) {
  const links = new Map<string, { url: string; expiresAt: number }>();
  return {
    /** Links still good at `now`, and the paths that need a new one. */
    lookup(paths: string[], now: number) {
      const found = new Map<string, string>();
      const missing: string[] = [];
      for (const path of new Set(paths)) {
        const link = links.get(path);
        if (link && link.expiresAt - now > marginMs) found.set(path, link.url);
        else missing.push(path);
      }
      return { found, missing };
    },
    store(path: string, url: string, expiresAt: number) {
      links.set(path, { url, expiresAt });
    },
    /** After a file is replaced (same path), its old link must not be reused. */
    forget(path: string) {
      links.delete(path);
    },
  };
}

import { describe, it, expect } from "vitest";
import { createLinkCache } from "./link-cache";

const HOUR = 60 * 60 * 1000;

describe("createLinkCache", () => {
  it("reuses a link that is still far from expiring", () => {
    const cache = createLinkCache(HOUR);
    cache.store("a.jpg", "https://link/a", 6 * HOUR);
    expect(cache.lookup(["a.jpg", "b.jpg"], 0)).toEqual({
      found: new Map([["a.jpg", "https://link/a"]]),
      missing: ["b.jpg"],
    });
  });

  it("asks for a new link when less than the margin is left", () => {
    const cache = createLinkCache(HOUR);
    cache.store("a.jpg", "https://link/a", 6 * HOUR);
    expect(cache.lookup(["a.jpg"], 5.5 * HOUR).missing).toEqual(["a.jpg"]);
  });

  it("forgets a replaced file and lists each path once", () => {
    const cache = createLinkCache(HOUR);
    cache.store("avatar.jpg", "https://link/old", 6 * HOUR);
    cache.forget("avatar.jpg");
    expect(cache.lookup(["avatar.jpg", "avatar.jpg"], 0).missing).toEqual([
      "avatar.jpg",
    ]);
  });
});

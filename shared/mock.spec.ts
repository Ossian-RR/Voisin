import { describe, it, expect } from "vitest";
import { CONDITION_CHOICES } from "./new-item";
import { findItem, items, visibleItems } from "./mock";

describe("visibleItems", () => {
  it("hides items with status removed", () => {
    const result = visibleItems(items);
    expect(result.some((item) => item.status === "removed")).toBe(false);
    expect(result.length).toBe(
      items.length - items.filter((i) => i.status === "removed").length,
    );
  });
});

describe("findItem", () => {
  it("returns the item for a known id", () => {
    expect(findItem(items, "cordless-drill")?.title).toBe(
      "Perceuse sans fil avec coffret d’embouts",
    );
  });

  it("returns undefined for an unknown id", () => {
    expect(findItem(items, "does-not-exist")).toBeUndefined();
  });

  it("returns undefined for a removed item", () => {
    expect(findItem(items, "old-bike-pump")).toBeUndefined();
  });

  it("returns undefined when no id is given", () => {
    expect(findItem(items, undefined)).toBeUndefined();
  });
});

describe("item conditions", () => {
  it("only uses “Bon état” or “Neuf”", () => {
    for (const item of items) {
      expect(CONDITION_CHOICES).toContain(item.condition);
    }
  });
});

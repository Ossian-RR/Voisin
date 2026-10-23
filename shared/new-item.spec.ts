import { describe, it, expect } from "vitest";
import {
  EMPTY_DRAFT,
  isGift,
  validateNewItem,
  type NewItemDraft,
} from "./new-item";

const photo = "data:image/jpeg;base64,AAAA";
const complete: NewItemDraft = {
  isGift: false,
  photos: [photo, photo],
  title: "  Scie sauteuse ",
  description: "Avec deux lames.",
  condition: "Bon état",
};
describe("validateNewItem", () => {
  it("accepts a complete draft", () => {
    expect(validateNewItem(complete)).toEqual({});
  });

  it("asks for every field on an empty draft", () => {
    expect(Object.keys(validateNewItem(EMPTY_DRAFT)).sort()).toEqual([
      "condition",
      "description",
      "photos",
      "title",
    ]);
  });

  it("requires at least two photos", () => {
    expect(validateNewItem({ ...complete, photos: [] }).photos).toBe(
      "Ajoutez au moins 2 photos.",
    );
    expect(validateNewItem({ ...complete, photos: [photo] }).photos).toBe(
      "Ajoutez encore 1 photo.",
    );
  });
});

describe("isGift", () => {
  it("tells gifts from loans", () => {
    expect(isGift({ kind: "gift" })).toBe(true);
    expect(isGift({ kind: "loan" })).toBe(false);
  });
});

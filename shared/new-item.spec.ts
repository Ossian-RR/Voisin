import { describe, it, expect } from "vitest";
import {
  createUserItem,
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
const owner = {
  id: "me",
  profile: {
    civility: "Madame" as const,
    lastName: "Martin",
    location: "B-2c",
  },
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

describe("createUserItem", () => {
  const now = new Date("2026-10-13T10:00:00.000Z");

  it("creates an available loan owned by the neighbor", () => {
    const item = createUserItem(complete, owner, now, "i1");
    expect(item).toMatchObject({
      id: "i1",
      title: "Scie sauteuse",
      kind: "loan",
      status: "available",
      condition: "Bon état",
      ownerId: "me",
      ownerFirstName: "Madame Martin",
      location: "B-2c",
      createdAt: "2026-10-13T10:00:00.000Z",
    });
    expect(item.photos.map((p) => p.src)).toEqual([photo, photo]);
    expect(isGift(item)).toBe(false);
  });

  it("marks a gift when “Je donne” is on", () => {
    expect(
      isGift(createUserItem({ ...complete, isGift: true }, owner, now, "i2")),
    ).toBe(true);
  });
});

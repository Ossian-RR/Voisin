import { describe, it, expect } from "vitest";
import {
  itemFromRow,
  itemPhotoPath,
  newItemRow,
  ownerLabel,
  photoPaths,
  storedPhotos,
  type ItemRowWithOwner,
} from "./items-db";

const row: ItemRowWithOwner = {
  id: "item-1",
  title: "Perceuse",
  category: "Tools",
  kind: "loan",
  status: "available",
  description: "18 V",
  condition: "Neuf",
  photos: [
    { path: "user-1/items/item-1/1.jpg", label: "Photo 1", hue: 160 },
    { label: "Vue de face", hue: 28 },
  ],
  created_at: "2026-10-20T10:00:00Z",
  owner_id: "profile-1",
  owner: {
    civility: "Madame",
    last_name: "Martin",
    location: "B-2c",
  },
};

describe("ownerLabel", () => {
  it("shows civility and last name", () => {
    expect(ownerLabel(row.owner)).toBe("Madame Martin");
  });

  it("copes with a missing owner", () => {
    expect(ownerLabel(null)).toBe("Un voisin");
  });
});

describe("storedPhotos", () => {
  it("keeps well-formed entries and drops the rest", () => {
    expect(
      storedPhotos([
        { path: "a.jpg", label: "Photo 1", hue: 10 },
        "oops",
        null,
        { hue: "red" },
      ]),
    ).toEqual([
      { path: "a.jpg", label: "Photo 1", hue: 10 },
      { label: "Photo", hue: 160 },
    ]);
  });

  it("returns nothing for a non-list", () => {
    expect(storedPhotos({})).toEqual([]);
    expect(storedPhotos(null)).toEqual([]);
  });
});

describe("itemFromRow", () => {
  it("builds the app's item with the owner's flat and photo links", () => {
    const item = itemFromRow(
      row,
      new Map([["user-1/items/item-1/1.jpg", "https://link/1"]]),
    );
    expect(item).toMatchObject({
      id: "item-1",
      category: "Tools",
      kind: "loan",
      status: "available",
      condition: "Neuf",
      ownerId: "profile-1",
      ownerFirstName: "Madame Martin",
      location: "B-2c",
    });
    expect(item.photos).toEqual([
      {
        path: "user-1/items/item-1/1.jpg",
        label: "Photo 1",
        hue: 160,
        src: "https://link/1",
      },
      { label: "Vue de face", hue: 28 },
    ]);
  });

  it("leaves out an unknown category", () => {
    const item = itemFromRow({ ...row, category: null }, new Map());
    expect(item).not.toHaveProperty("category");
  });
});

describe("photoPaths", () => {
  it("lists only stored photos", () => {
    expect(photoPaths([row])).toEqual(["user-1/items/item-1/1.jpg"]);
  });
});

describe("itemPhotoPath", () => {
  it("puts photos under the neighbor's own folder", () => {
    expect(itemPhotoPath("user-1", "item-1", 0)).toBe(
      "user-1/items/item-1/1.jpg",
    );
  });
});

describe("newItemRow", () => {
  it("builds the row to insert", () => {
    expect(
      newItemRow(
        {
          isGift: true,
          title: "  Cartons ",
          description: " Dix cartons ",
          condition: "Bon état",
        },
        { itemId: "item-2", ownerProfileId: "profile-1" },
        ["user-1/items/item-2/1.jpg", "user-1/items/item-2/2.jpg"],
      ),
    ).toEqual({
      id: "item-2",
      owner_id: "profile-1",
      title: "Cartons",
      kind: "gift",
      description: "Dix cartons",
      condition: "Bon état",
      photos: [
        { path: "user-1/items/item-2/1.jpg", label: "Photo 1", hue: 160 },
        { path: "user-1/items/item-2/2.jpg", label: "Photo 2", hue: 160 },
      ],
    });
  });

  it("can keep the status and date of an item copied from the browser", () => {
    expect(
      newItemRow(
        {
          isGift: false,
          title: "Pompe",
          description: "Vélo",
          condition: "Neuf",
        },
        { itemId: "item-3", ownerProfileId: "profile-1" },
        [],
        { status: "unavailable", createdAt: "2026-10-20T09:00:00Z" },
      ),
    ).toMatchObject({
      status: "unavailable",
      created_at: "2026-10-20T09:00:00Z",
    });
  });
});

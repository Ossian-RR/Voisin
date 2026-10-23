import { describe, it, expect } from "vitest";
import {
  itemFromRow,
  itemPhotoPath,
  newItemRow,
  newProfileRow,
  newRequestRow,
  newWantedRow,
  personName,
  photoPaths,
  requestFromRow,
  storedPhotos,
  wantedFromRow,
  type ItemRow,
} from "./db";

const martin = { civility: "Madame", last_name: "Martin", location: "B-2c" };
const itemRow: ItemRow = {
  id: "item-1",
  title: "Perceuse",
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
  owner: martin,
};

describe("personName", () => {
  it("shows civility and last name, or a neutral fallback", () => {
    expect(personName(martin)).toBe("Madame Martin");
    expect(personName(null)).toBe("Un voisin");
    expect(personName({ ...martin, civility: "Docteur" })).toBe("Un voisin");
  });
});

describe("storedPhotos", () => {
  it("keeps well-formed entries and drops the rest", () => {
    expect(
      storedPhotos([
        { path: "a.jpg", label: "Photo 1", hue: 10 },
        "oops",
        null,
      ]),
    ).toEqual([{ path: "a.jpg", label: "Photo 1", hue: 10 }]);
    expect(storedPhotos({})).toEqual([]);
  });
});

describe("itemFromRow", () => {
  it("builds the item with the owner's name, flat and photo links", () => {
    const item = itemFromRow(
      itemRow,
      new Map([["user-1/items/item-1/1.jpg", "https://link/1"]]),
    );
    expect(item).toMatchObject({
      id: "item-1",
      kind: "loan",
      status: "available",
      condition: "Neuf",
      ownerId: "profile-1",
      ownerName: "Madame Martin",
      location: "B-2c",
    });
    expect(item.photos[0].src).toBe("https://link/1");
    expect(item.photos[1].src).toBeUndefined();
  });

  it("lists only stored photo paths", () => {
    expect(photoPaths([itemRow])).toEqual(["user-1/items/item-1/1.jpg"]);
  });
});

describe("wantedFromRow", () => {
  it("shortens the time and leaves out empty fields", () => {
    expect(
      wantedFromRow({
        id: "w1",
        text: "Une scie",
        wanted_on: null,
        wanted_at: "14:30:00",
        created_at: "2026-10-20T10:00:00Z",
        author_id: "profile-1",
        author: martin,
      }),
    ).toEqual({
      id: "w1",
      authorId: "profile-1",
      authorName: "Madame Martin",
      text: "Une scie",
      wantedAt: "14:30",
      createdAt: "2026-10-20T10:00:00Z",
    });
  });
});

describe("requestFromRow", () => {
  it("carries the borrower and the item", () => {
    const request = requestFromRow(
      {
        id: "r1",
        item_id: "item-1",
        borrower_id: "profile-2",
        status: "approved",
        requested_from: "2026-10-25",
        requested_at: "18:15:00",
        created_at: "2026-10-21T10:00:00Z",
        borrower: {
          civility: "Famille",
          last_name: "Durand",
          location: "A-1a",
        },
        item: itemRow,
      },
      new Map(),
    );
    expect(request).toMatchObject({
      borrowerName: "Famille Durand",
      borrowerLocation: "A-1a",
      status: "approved",
      wantedOn: "2026-10-25",
      wantedAt: "18:15",
    });
    expect(request.item?.title).toBe("Perceuse");
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
          title: " Cartons ",
          description: " Dix ",
          condition: "Bon état",
        },
        { itemId: "item-2", ownerProfileId: "profile-1" },
        ["user-1/items/item-2/1.jpg"],
      ),
    ).toEqual({
      id: "item-2",
      owner_id: "profile-1",
      title: "Cartons",
      kind: "gift",
      description: "Dix",
      condition: "Bon état",
      photos: [
        { path: "user-1/items/item-2/1.jpg", label: "Photo 1", hue: 160 },
      ],
    });
  });
});

describe("newWantedRow", () => {
  it("keeps the text as typed, only trimmed", () => {
    expect(newWantedRow("p1", { text: "  une égoïne  " })?.text).toBe(
      "une égoïne",
    );
  });

  it("refuses an empty text", () => {
    expect(newWantedRow("p1", { text: "   " })).toBeUndefined();
  });

  it("keeps an allowed time and drops the others", () => {
    expect(
      newWantedRow("p1", { text: "x", wantedAt: "18:00" })?.wanted_at,
    ).toBe("18:00");
    expect(
      newWantedRow("p1", { text: "x", wantedAt: "14:20" })?.wanted_at,
    ).toBeNull();
    expect(
      newWantedRow("p1", { text: "x", wantedOn: "" })?.wanted_on,
    ).toBeNull();
  });
});

describe("newProfileRow", () => {
  it("links the profile to the login, tidies it, and never sets the residence", () => {
    const row = newProfileRow("user-1", {
      civility: "Madame",
      lastName: "  Le   Gall ",
      location: "a - 3A",
    });
    expect(row).toEqual({
      user_id: "user-1",
      civility: "Madame",
      last_name: "Le Gall",
      location: "A-3a",
    });
  });
});

describe("newRequestRow", () => {
  it("keeps the wished day and an allowed time", () => {
    expect(
      newRequestRow("item-1", "p1", {
        wantedOn: "2026-10-25",
        wantedAt: "09:30",
      }),
    ).toEqual({
      item_id: "item-1",
      borrower_id: "p1",
      requested_from: "2026-10-25",
      requested_at: "09:30",
    });
  });

  it("leaves day and time empty when not given or not allowed", () => {
    expect(newRequestRow("item-1", "p1", { wantedAt: "06:00" })).toMatchObject({
      requested_from: null,
      requested_at: null,
    });
  });
});

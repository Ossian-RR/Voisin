import { describe, it, expect } from "vitest";
import type { BorrowRequest, Item } from "./api";
import {
  canRequest,
  findOpenRequest,
  itemStatusAfter,
  sortRequests,
} from "./borrow";

const drill: Item = {
  id: "drill",
  title: "Perceuse",
  kind: "loan",
  status: "available",
  description: "",
  condition: "Bon état",
  ownerId: "owner",
  ownerName: "Madame Martin",
  location: "B-2c",
  photos: [],
  createdAt: "2026-10-01T00:00:00Z",
};

function request(patch: Partial<BorrowRequest> = {}): BorrowRequest {
  return {
    id: "r1",
    itemId: "drill",
    borrowerId: "me",
    borrowerName: "Monsieur Durand",
    borrowerLocation: "A-1a",
    status: "pending",
    createdAt: "2026-10-10T09:00:00Z",
    ...patch,
  };
}

describe("canRequest", () => {
  it("allows a request on someone else's available item", () => {
    expect(canRequest(drill, [], "me")).toBe(true);
  });

  it("blocks an unavailable item and the neighbor's own item", () => {
    expect(canRequest({ ...drill, status: "unavailable" }, [], "me")).toBe(
      false,
    );
    expect(canRequest(drill, [], "owner")).toBe(false);
  });

  it("blocks a second request while one is open", () => {
    expect(canRequest(drill, [request()], "me")).toBe(false);
    expect(canRequest(drill, [request({ status: "approved" })], "me")).toBe(
      false,
    );
  });

  it("allows a new request once the previous one was declined", () => {
    expect(canRequest(drill, [request({ status: "declined" })], "me")).toBe(
      true,
    );
  });

  it("ignores other borrowers' requests", () => {
    expect(
      findOpenRequest([request({ borrowerId: "other" })], "drill", "me"),
    ).toBeUndefined();
  });
});

describe("itemStatusAfter", () => {
  it("lends a loan out when approved and brings it back when returned", () => {
    expect(itemStatusAfter("approved", { kind: "loan" })).toBe("unavailable");
    expect(itemStatusAfter("returned", { kind: "loan" })).toBe("available");
  });

  it("takes a gift off the list once given", () => {
    expect(itemStatusAfter("approved", { kind: "gift" })).toBe("removed");
  });

  it("leaves the item alone when declined", () => {
    expect(itemStatusAfter("declined", { kind: "loan" })).toBeUndefined();
  });
});

describe("sortRequests", () => {
  it("puts the newest request first", () => {
    const older = request({ id: "old", createdAt: "2026-10-01T00:00:00Z" });
    const newer = request({ id: "new", createdAt: "2026-10-09T00:00:00Z" });
    expect(sortRequests([older, newer]).map((r) => r.id)).toEqual([
      "new",
      "old",
    ]);
  });
});

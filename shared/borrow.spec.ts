import { describe, it, expect } from "vitest";
import type { BorrowRequest } from "./api";
import { canRequest, createBorrowRequest, findOpenRequest, sortRequests } from "./borrow";
import { findItem, items } from "./mock";

const drill = findItem(items, "cordless-drill")!;
const ladder = findItem(items, "three-step-ladder")!;
const now = new Date("2026-10-10T09:00:00.000Z");

describe("createBorrowRequest", () => {
  it("creates a pending request for the item", () => {
    const request = createBorrowRequest(drill, "me", now, "r1");
    expect(request).toEqual({
      id: "r1",
      itemId: "cordless-drill",
      borrowerId: "me",
      status: "pending",
      createdAt: "2026-10-10T09:00:00.000Z",
    });
  });
});

describe("canRequest", () => {
  it("allows a request on an available item", () => {
    expect(canRequest(drill, [], "me")).toBe(true);
  });

  it("blocks an unavailable item", () => {
    expect(canRequest(ladder, [], "me")).toBe(false);
  });

  it("blocks a second request while one is pending", () => {
    const pending = createBorrowRequest(drill, "me", now, "r1");
    expect(canRequest(drill, [pending], "me")).toBe(false);
  });

  it("allows a new request once the previous one was declined", () => {
    const declined: BorrowRequest = { ...createBorrowRequest(drill, "me", now, "r1"), status: "declined" };
    expect(canRequest(drill, [declined], "me")).toBe(true);
  });

  it("ignores other borrowers' requests", () => {
    const theirs = createBorrowRequest(drill, "someone-else", now, "r1");
    expect(findOpenRequest([theirs], drill.id, "me")).toBeUndefined();
  });
});

describe("sortRequests", () => {
  it("puts the newest request first", () => {
    const older = createBorrowRequest(drill, "me", new Date("2026-10-01T00:00:00Z"), "old");
    const newer = createBorrowRequest(drill, "me", new Date("2026-10-09T00:00:00Z"), "new");
    expect(sortRequests([older, newer]).map((r) => r.id)).toEqual(["new", "old"]);
  });
});

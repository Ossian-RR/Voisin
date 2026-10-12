import { describe, it, expect } from "vitest";
import { describeLocation, isValidLocation, parseLocation } from "./location";
import { items } from "./mock";

describe("parseLocation", () => {
  it("reads part, floor and door", () => {
    expect(parseLocation("B-12d")).toEqual({ part: "B", floor: 12, door: "d" });
  });

  it("rejects references that do not follow X-Nn", () => {
    for (const ref of ["a-3a", "A3a", "A-a", "A-3", "A-3A", "120 m", ""]) {
      expect(isValidLocation(ref)).toBe(false);
    }
  });
});

describe("describeLocation", () => {
  it("spells the flat out in French", () => {
    expect(describeLocation("A-3a")).toBe("Bâtiment A, 3e étage, porte a");
    expect(describeLocation("C-1b")).toBe("Bâtiment C, 1er étage, porte b");
    expect(describeLocation("B-0c")).toBe("Bâtiment B, rez-de-chaussée, porte c");
  });
});

describe("mock data", () => {
  it("uses valid flat references everywhere", () => {
    for (const entry of items) {
      expect(isValidLocation(entry.location)).toBe(true);
    }
  });
});

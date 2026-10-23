import { describe, it, expect } from "vitest";
import { normalizeLocation } from "./location";
import {
  cleanProfile,
  displayName,
  hasFieldChanges,
  isCivility,
  validateProfile,
} from "./profile";

describe("normalizeLocation", () => {
  it("tidies case and spaces", () => {
    expect(normalizeLocation(" a - 3A ")).toBe("A-3a");
    expect(normalizeLocation("b12d")).toBe("B-12d");
  });

  it("leaves text it cannot read unchanged, without spaces", () => {
    expect(normalizeLocation("3e étage")).toBe("3eétage");
  });
});

describe("validateProfile", () => {
  it("accepts a complete profile", () => {
    expect(
      validateProfile({
        civility: "Famille",
        lastName: "Durand",
        location: "c-1b",
      }),
    ).toEqual({});
  });

  it("asks for a family name", () => {
    expect(
      validateProfile({
        civility: "Monsieur",
        lastName: "  ",
        location: "A-1a",
      }).lastName,
    ).toBeDefined();
  });

  it("explains the flat format", () => {
    expect(
      validateProfile({
        civility: "Madame",
        lastName: "Martin",
        location: "3e étage",
      }).location,
    ).toContain("A-3a");
  });
});

describe("cleanProfile", () => {
  it("trims the name and normalizes the flat", () => {
    expect(
      cleanProfile({
        civility: "Madame",
        lastName: "  De  la Tour ",
        location: "a-3A",
      }),
    ).toEqual({ civility: "Madame", lastName: "De la Tour", location: "A-3a" });
  });
});

describe("isCivility", () => {
  it("accepts only the three civilities", () => {
    expect(isCivility("Famille")).toBe(true);
    expect(isCivility("Docteur")).toBe(false);
    expect(isCivility(null)).toBe(false);
  });
});

describe("displayName", () => {
  it("puts the civility before the family name", () => {
    expect(displayName({ civility: "Famille", lastName: "Martin" })).toBe(
      "Famille Martin",
    );
  });
});

describe("hasFieldChanges", () => {
  const base = {
    civility: "Madame" as const,
    lastName: "Martin",
    location: "B-2c",
  };

  it("ignores spacing and case differences that cleaning removes", () => {
    expect(hasFieldChanges({ ...base, location: "b-2C" }, base)).toBe(false);
    expect(hasFieldChanges({ ...base, civility: "Famille" }, base)).toBe(true);
  });
});

import { describe, it, expect } from "vitest";
import { normalizeLocation } from "./location";
import {
  cleanProfile,
  hasFieldChanges,
  isNeighborProfile,
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

describe("isNeighborProfile", () => {
  it("rejects unknown civilities and missing fields", () => {
    expect(
      isNeighborProfile({
        civility: "Docteur",
        lastName: "X",
        location: "A-1a",
      }),
    ).toBe(false);
    expect(isNeighborProfile({ civility: "Madame" })).toBe(false);
    expect(isNeighborProfile(null)).toBe(false);
  });
});

describe("profile photo", () => {
  const base = {
    civility: "Madame" as const,
    lastName: "Martin",
    location: "B-2c",
  };
  const photo = "data:image/jpeg;base64,AAAA";

  it("keeps a valid photo and drops anything else", () => {
    expect(cleanProfile({ ...base, photo }).photo).toBe(photo);
    expect(
      cleanProfile({ ...base, photo: "https://example.com/x.jpg" }).photo,
    ).toBeUndefined();
  });

  it("accepts a stored profile with or without a photo", () => {
    expect(isNeighborProfile({ ...base, photo })).toBe(true);
    expect(isNeighborProfile(base)).toBe(true);
    expect(isNeighborProfile({ ...base, photo: 42 })).toBe(false);
  });

  it("ignores the photo when checking for unsaved form changes", () => {
    expect(hasFieldChanges(base, { ...base, photo })).toBe(false);
    expect(hasFieldChanges({ ...base, civility: "Famille" }, base)).toBe(true);
  });
});

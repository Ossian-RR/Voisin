import { describe, it, expect } from "vitest";
import { helpErrorMessage, residenceTitle } from "./residence";

describe("helpErrorMessage", () => {
  it("explains the daily limit set by the database", () => {
    expect(
      helpErrorMessage({
        message: "P0001: too_many_help_messages",
      }),
    ).toMatch(/5 messages aujourd’hui/);
  });

  it("falls back to a connection message", () => {
    expect(helpErrorMessage({ message: "Failed to fetch" })).toMatch(
      /connexion/,
    );
    expect(helpErrorMessage({})).toMatch(/connexion/);
  });
});

describe("residenceTitle", () => {
  it("puts « Résidence » before the name", () => {
    expect(residenceTitle({ name: "Les Tilleuls" })).toBe(
      "Résidence Les Tilleuls",
    );
  });

  it("says « Résidence » alone without a name", () => {
    expect(residenceTitle({})).toBe("Résidence");
    expect(residenceTitle({ name: "  " })).toBe("Résidence");
  });

  it("does not repeat « Résidence » when the name starts with it", () => {
    expect(residenceTitle({ name: "Résidence Les Tilleuls" })).toBe(
      "Résidence Les Tilleuls",
    );
    expect(residenceTitle({ name: "RÉSIDENCE DU PARC" })).toBe(
      "RÉSIDENCE DU PARC",
    );
  });

  it("keeps a name that only contains the word later", () => {
    expect(residenceTitle({ name: "Parc Résidence" })).toBe(
      "Résidence Parc Résidence",
    );
  });
});

import { describe, it, expect } from "vitest";
import { helpErrorMessage } from "./residence";

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

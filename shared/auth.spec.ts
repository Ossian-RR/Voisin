import { describe, it, expect } from "vitest";
import {
  linkErrorMessage,
  newProfileRow,
  profileFromRow,
  signInErrorMessage,
} from "./auth";

describe("signInErrorMessage", () => {
  it("says the address isn't invited when sign-ups are closed", () => {
    expect(signInErrorMessage({ code: "otp_disabled" })).toMatch(
      /pas encore été invitée/,
    );
    expect(signInErrorMessage({ code: "signup_disabled" })).toMatch(
      /pas encore été invitée/,
    );
  });

  it("asks to wait when too many links were requested", () => {
    expect(signInErrorMessage({ code: "over_email_send_rate_limit" })).toMatch(
      /Patientez/,
    );
    expect(signInErrorMessage({ status: 429 })).toMatch(/Patientez/);
  });

  it("flags an invalid address", () => {
    expect(signInErrorMessage({ code: "email_address_invalid" })).toMatch(
      /pas valide/,
    );
  });

  it("falls back to a generic message", () => {
    expect(signInErrorMessage({ status: 500 })).toMatch(/réessayez/);
    expect(signInErrorMessage({})).toMatch(/réessayez/);
  });
});

describe("linkErrorMessage", () => {
  it("ignores an address without error", () => {
    expect(linkErrorMessage("")).toBeUndefined();
    expect(
      linkErrorMessage("#access_token=abc&type=magiclink"),
    ).toBeUndefined();
  });

  it("explains an expired or used link", () => {
    expect(
      linkErrorMessage(
        "#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid",
      ),
    ).toMatch(/expiré/);
  });

  it("explains any other link error", () => {
    expect(linkErrorMessage("#error=server_error")).toMatch(
      /ne fonctionne pas/,
    );
  });
});

describe("newProfileRow", () => {
  it("links the profile to the login and tidies the fields", () => {
    expect(
      newProfileRow("user-1", {
        civility: "Madame",
        lastName: "  Le   Gall ",
        location: "a - 3A",
      }),
    ).toEqual({
      user_id: "user-1",
      civility: "Madame",
      last_name: "Le Gall",
      location: "A-3a",
    });
  });

  it("never sends the admission date (the database sets it)", () => {
    const row = newProfileRow("user-1", {
      civility: "Famille",
      lastName: "Martin",
      location: "B-2c",
    });
    expect(row).not.toHaveProperty("admitted_on");
  });
});

describe("profileFromRow", () => {
  it("reads a database row", () => {
    expect(
      profileFromRow({
        civility: "Famille",
        last_name: "Martin",
        location: "B-2c",
      }),
    ).toEqual({ civility: "Famille", lastName: "Martin", location: "B-2c" });
  });

  it("rejects an unknown civility", () => {
    expect(
      profileFromRow({
        civility: "Docteur",
        last_name: "Martin",
        location: "B-2c",
      }),
    ).toBeUndefined();
  });
});

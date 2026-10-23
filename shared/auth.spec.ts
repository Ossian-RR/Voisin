import { describe, it, expect } from "vitest";
import { linkErrorMessage, signInErrorMessage } from "./auth";

describe("signInErrorMessage", () => {
  it("says the address isn't invited when sign-ups are closed", () => {
    expect(signInErrorMessage({ code: "otp_disabled" })).toMatch(
      /pas encore été invitée/,
    );
  });

  it("asks to wait when too many links were requested", () => {
    expect(signInErrorMessage({ code: "over_email_send_rate_limit" })).toMatch(
      /Patientez/,
    );
    expect(signInErrorMessage({ status: 429 })).toMatch(/Patientez/);
  });

  it("falls back to a generic message", () => {
    expect(signInErrorMessage({ status: 500 })).toMatch(/réessayez/);
  });
});

describe("linkErrorMessage", () => {
  it("ignores an address without error", () => {
    expect(linkErrorMessage("")).toBeUndefined();
    expect(linkErrorMessage("#access_token=abc")).toBeUndefined();
  });

  it("explains an expired or used link, and any other error", () => {
    expect(
      linkErrorMessage("#error=access_denied&error_code=otp_expired"),
    ).toMatch(/expiré/);
    expect(linkErrorMessage("#error=server_error")).toMatch(
      /ne fonctionne pas/,
    );
  });
});

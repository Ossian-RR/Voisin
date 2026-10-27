import { describe, it, expect } from "vitest";
import {
  EMPTY_RESIDENCE_REQUEST,
  residenceRequestErrorMessage,
  residenceRequestRow,
  validateResidenceRequest,
} from "./residence-request";

const complete = {
  contactName: " Marie Martin ",
  email: " marie@exemple.fr ",
  address: " 12 rue des Lilas, Lyon ",
  flats: " 24 ",
  message: "  ",
};

describe("validateResidenceRequest", () => {
  it("accepts a complete request", () => {
    expect(validateResidenceRequest(complete)).toEqual({});
  });

  it("asks for name, e-mail and address", () => {
    expect(
      Object.keys(validateResidenceRequest(EMPTY_RESIDENCE_REQUEST)).sort(),
    ).toEqual(["address", "contactName", "email"]);
  });

  it("accepts an empty number of flats but not a wrong one", () => {
    expect(
      validateResidenceRequest({ ...complete, flats: "" }).flats,
    ).toBeUndefined();
    for (const flats of ["0", "2.5", "beaucoup", "5000"])
      expect(
        validateResidenceRequest({ ...complete, flats }).flats,
      ).toBeDefined();
  });
});

describe("residenceRequestRow", () => {
  it("trims the fields and leaves empty ones out", () => {
    expect(residenceRequestRow(complete)).toEqual({
      contact_name: "Marie Martin",
      email: "marie@exemple.fr",
      address: "12 rue des Lilas, Lyon",
      flats: 24,
      message: null,
    });
  });
});

describe("residenceRequestErrorMessage", () => {
  it("explains a second request the same day", () => {
    expect(
      residenceRequestErrorMessage({ message: "already_requested" }),
    ).toMatch(/déjà été envoyée/);
  });

  it("falls back to a generic message", () => {
    expect(residenceRequestErrorMessage({})).toMatch(/réessayez/);
  });
});

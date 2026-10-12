import { describe, it, expect } from "vitest";
import { residenceTitle } from "./residence";
import { createWantedRequest, displayName, todayIso } from "./wanted";

const now = new Date("2026-10-12T09:00:00.000Z");
const author = {
  id: "me",
  profile: { civility: "Madame" as const, lastName: "Martin" },
};

describe("displayName", () => {
  it("puts the civility before the family name", () => {
    expect(displayName({ civility: "Famille", lastName: "Martin" })).toBe(
      "Famille Martin",
    );
  });
});

describe("createWantedRequest", () => {
  it("keeps the text as typed, typos included", () => {
    const request = createWantedRequest(
      { text: "  une scie sauteuse ou un égoïne  " },
      author,
      now,
      "w1",
    );
    expect(request?.text).toBe("une scie sauteuse ou un égoïne");
  });

  it("records who is looking, for the neighbors", () => {
    const request = createWantedRequest({ text: "scie" }, author, now, "w1");
    expect(request?.authorName).toBe("Madame Martin");
  });

  it("refuses an empty text", () => {
    expect(
      createWantedRequest({ text: "   " }, author, now, "w1"),
    ).toBeUndefined();
  });

  it("keeps the wished date when given, and leaves it out otherwise", () => {
    expect(
      createWantedRequest(
        { text: "scie", wantedOn: "2026-10-20" },
        author,
        now,
        "w1",
      )?.wantedOn,
    ).toBe("2026-10-20");
    expect(
      createWantedRequest({ text: "scie", wantedOn: "" }, author, now, "w1")
        ?.wantedOn,
    ).toBeUndefined();
  });
});

describe("todayIso", () => {
  it("formats the local date as yyyy-mm-dd", () => {
    expect(todayIso(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("residenceTitle", () => {
  it("shows only “Résidence” when there is no name", () => {
    expect(residenceTitle({ address: "333 rue des Pyrénées" })).toBe(
      "Résidence",
    );
  });

  it("adds the name when there is one", () => {
    expect(residenceTitle({ name: "Les Tilleuls", address: "x" })).toBe(
      "Résidence Les Tilleuls",
    );
  });
});

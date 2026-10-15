import { describe, it, expect } from "vitest";
import { residenceTitle } from "./residence";
import {
  createWantedRequest,
  displayName,
  DEFAULT_HOUR,
  DEFAULT_MINUTE,
  isAllowedTime,
  todayIso,
  wantedWhenLabel,
} from "./wanted";

const now = new Date("2026-10-12T09:00:00.000Z");
const author = {
  id: "me",
  profile: {
    civility: "Madame" as const,
    lastName: "Martin",
    location: "B-2c",
  },
};

describe("displayName", () => {
  it("puts the civility before the family name", () => {
    expect(
      displayName({
        civility: "Famille",
        lastName: "Martin",
        location: "A-1a",
      }),
    ).toBe("Famille Martin");
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

describe("wantedWhenLabel", () => {
  it("joins the date and the time", () => {
    expect(wantedWhenLabel({ wantedOn: "2026-10-20", wantedAt: "14:30" })).toBe(
      "Pour le mardi 20 octobre à 14h30",
    );
  });

  it("works with only a date, only a time, or nothing", () => {
    expect(wantedWhenLabel({ wantedOn: "2026-10-20" })).toBe(
      "Pour le mardi 20 octobre",
    );
    expect(wantedWhenLabel({ wantedAt: "09:05" })).toBe("À 9h05");
    expect(wantedWhenLabel({})).toBe("Pas de date précise");
  });

  it("keeps the time when publishing", () => {
    const request = createWantedRequest(
      { text: "scie", wantedAt: "18:00" },
      author,
      now,
      "w1",
    );
    expect(request?.wantedAt).toBe("18:00");
  });
});

describe("isAllowedTime", () => {
  it("only accepts quarter hours from 7:00 to 22:00", () => {
    for (const ok of ["07:00", "09:15", "14:30", "21:45", "22:00"])
      expect(isAllowedTime(ok)).toBe(true);
    for (const ko of ["06:45", "22:15", "23:00", "00:00", "14:20", "7:15", ""])
      expect(isAllowedTime(ko)).toBe(false);
  });

  it("drops a time outside the allowed slots", () => {
    for (const wantedAt of ["14:20", "06:30", "22:30"]) {
      const request = createWantedRequest(
        { text: "scie", wantedAt },
        author,
        now,
        "w1",
      );
      expect(request?.wantedAt).toBeUndefined();
    }
  });
});

describe("default time", () => {
  it("is 12:00, an allowed slot", () => {
    expect(`${DEFAULT_HOUR}:${DEFAULT_MINUTE}`).toBe("12:00");
    expect(isAllowedTime(`${DEFAULT_HOUR}:${DEFAULT_MINUTE}`)).toBe(true);
  });
});

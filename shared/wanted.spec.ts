import { describe, it, expect } from "vitest";
import { isValidEmail, residenceTitle } from "./residence";
import {
  DEFAULT_HOUR,
  DEFAULT_MINUTE,
  isAllowedTime,
  todayIso,
  wantedWhenLabel,
} from "./wanted";

describe("todayIso", () => {
  it("formats the local date as yyyy-mm-dd", () => {
    expect(todayIso(new Date(2026, 0, 5))).toBe("2026-01-05");
  });
});

describe("residenceTitle", () => {
  it("shows only “Résidence” when there is no name", () => {
    expect(residenceTitle({})).toBe("Résidence");
  });

  it("adds the name when there is one", () => {
    expect(residenceTitle({ name: "Les Tilleuls" })).toBe(
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
});

describe("isAllowedTime", () => {
  it("only accepts quarter hours from 7:00 to 22:00", () => {
    for (const ok of ["07:00", "09:15", "14:30", "21:45", "22:00"])
      expect(isAllowedTime(ok)).toBe(true);
    for (const ko of ["06:45", "22:15", "23:00", "00:00", "14:20", "7:15", ""])
      expect(isAllowedTime(ko)).toBe(false);
  });
});

describe("default time", () => {
  it("is 12:00, an allowed slot", () => {
    expect(`${DEFAULT_HOUR}:${DEFAULT_MINUTE}`).toBe("12:00");
    expect(isAllowedTime(`${DEFAULT_HOUR}:${DEFAULT_MINUTE}`)).toBe(true);
  });
});

describe("reply address", () => {
  it("accepts a normal address and rejects incomplete ones", () => {
    expect(isValidEmail(" marie.martin@exemple.fr ")).toBe(true);
    for (const ko of [
      "",
      "marie",
      "marie@",
      "marie@exemple",
      "marie @exemple.fr",
    ])
      expect(isValidEmail(ko)).toBe(false);
  });
});

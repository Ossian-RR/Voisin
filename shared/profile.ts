import type { NeighborProfile } from "./api";
import { isValidLocation, normalizeLocation } from "./location";
import { CIVILITIES } from "./wanted";

export type ProfileErrors = Partial<Record<"lastName" | "location", string>>;

/** Trims the name and tidies the flat reference before saving. */
export function cleanProfile(profile: NeighborProfile): NeighborProfile {
  return {
    civility: profile.civility,
    lastName: profile.lastName.trim().replace(/\s+/g, " "),
    location: normalizeLocation(profile.location),
  };
}

export function validateProfile(profile: NeighborProfile): ProfileErrors {
  const clean = cleanProfile(profile);
  const errors: ProfileErrors = {};
  if (!clean.lastName) errors.lastName = "Indiquez votre nom de famille.";
  if (!clean.location) {
    errors.location = "Indiquez votre logement.";
  } else if (!isValidLocation(clean.location)) {
    errors.location =
      "Format attendu : bâtiment-étage-porte, par exemple A-3a.";
  }
  return errors;
}

/** Guards what comes back from storage. */
export function isNeighborProfile(value: unknown): value is NeighborProfile {
  if (!value || typeof value !== "object") return false;
  const profile = value as Record<string, unknown>;
  return (
    CIVILITIES.includes(profile.civility as NeighborProfile["civility"]) &&
    typeof profile.lastName === "string" &&
    typeof profile.location === "string"
  );
}

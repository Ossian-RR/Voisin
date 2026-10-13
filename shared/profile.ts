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
    ...(isPhoto(profile.photo) ? { photo: profile.photo } : {}),
  };
}

export function isPhoto(value: unknown): value is string {
  return typeof value === "string" && value.startsWith("data:image/");
}

/** True when the fields typed in the form differ (the photo is saved on its own). */
export function hasFieldChanges(
  draft: NeighborProfile,
  saved: NeighborProfile,
): boolean {
  const a = cleanProfile(draft);
  const b = cleanProfile(saved);
  return (
    a.civility !== b.civility ||
    a.lastName !== b.lastName ||
    a.location !== b.location
  );
}

export function validateProfile(profile: NeighborProfile): ProfileErrors {
  const clean = cleanProfile(profile);
  const errors: ProfileErrors = {};
  if (!clean.lastName) errors.lastName = "Indiquez votre nom.";
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
    typeof profile.location === "string" &&
    (profile.photo === undefined || isPhoto(profile.photo))
  );
}

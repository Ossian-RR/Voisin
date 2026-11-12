import type { Civility, NeighborProfile } from "./api";
import { isValidLocation, normalizeLocation } from "./location";

export const CIVILITIES: Civility[] = ["Monsieur", "Madame", "Famille"];

/** Same bound as the profiles_last_name_length check in the database. */
export const MAX_LAST_NAME = 60;

export type ProfileErrors = Partial<Record<"lastName" | "location", string>>;

/** "Madame Martin", "Famille Martin"… */
export function displayName(
  profile: Pick<NeighborProfile, "civility" | "lastName">,
): string {
  return `${profile.civility} ${profile.lastName}`;
}

/** Trims the name and tidies the flat reference before saving. */
export function cleanProfile(profile: NeighborProfile): NeighborProfile {
  return {
    civility: profile.civility,
    lastName: profile.lastName.trim().replace(/\s+/g, " "),
    location: normalizeLocation(profile.location),
  };
}

/** True when the fields typed in the form differ from the saved profile. */
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
  else if (clean.lastName.length > MAX_LAST_NAME)
    errors.lastName = `Le nom ne doit pas dépasser ${MAX_LAST_NAME} caractères.`;
  if (!clean.location) {
    errors.location = "Indiquez votre logement.";
  } else if (!isValidLocation(clean.location)) {
    errors.location =
      "Format attendu : bâtiment-étage-porte, par exemple A-3a.";
  }
  return errors;
}

export function isCivility(value: unknown): value is Civility {
  return CIVILITIES.includes(value as Civility);
}

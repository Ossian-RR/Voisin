import type { Civility, NeighborProfile, WantedRequest } from "./api";

export const CIVILITIES: Civility[] = ["Monsieur", "Madame", "Famille"];

/** "Madame Martin", "Famille Martin"… */
export function displayName(profile: NeighborProfile): string {
  return `${profile.civility} ${profile.lastName}`;
}

/**
 * The text is kept exactly as typed (no filter, no correction).
 * Only surrounding spaces are trimmed; an empty text is refused.
 */
export function createWantedRequest(
  input: { text: string; wantedOn?: string },
  authorId: string,
  now: Date,
  id: string,
): WantedRequest | undefined {
  const text = input.text.trim();
  if (!text) return undefined;
  return {
    id,
    authorId,
    text,
    wantedOn: input.wantedOn || undefined,
    createdAt: now.toISOString(),
  };
}

/** Today as yyyy-mm-dd in local time, for the date input's `min`. */
export function todayIso(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
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
  input: { text: string; wantedOn?: string; wantedAt?: string },
  author: { id: string; profile: NeighborProfile },
  now: Date,
  id: string,
): WantedRequest | undefined {
  const text = input.text.trim();
  if (!text) return undefined;
  return {
    id,
    authorId: author.id,
    authorName: displayName(author.profile),
    text,
    wantedOn: input.wantedOn || undefined,
    wantedAt:
      input.wantedAt && isAllowedTime(input.wantedAt)
        ? input.wantedAt
        : undefined,
    createdAt: now.toISOString(),
  };
}

/** Searches are set to the quarter hour, between 7:00 and 22:00. */
export const QUARTER_MINUTES = ["00", "15", "30", "45"] as const;
export const FIRST_HOUR = 7;
export const LAST_HOUR = 22;
export const HOURS = Array.from(
  { length: LAST_HOUR - FIRST_HOUR + 1 },
  (_, i) => String(FIRST_HOUR + i).padStart(2, "0"),
);

/** "à l’heure suivante :" starts at 12:00; the neighbor can change or clear it. */
export const DEFAULT_HOUR = "12";
export const DEFAULT_MINUTE = "00";

/** 22h only allows 22:00, so the time never goes past 22:00. */
export function minutesFor(hour: string): readonly string[] {
  return Number(hour) === LAST_HOUR ? ["00"] : QUARTER_MINUTES;
}

/** "14:30" and "22:00" pass; "14:20", "06:45", "22:15" or "7:15" do not. */
export function isAllowedTime(time: string): boolean {
  const match = /^(\d{2}):(\d{2})$/.exec(time);
  return (
    !!match &&
    HOURS.includes(match[1]) &&
    minutesFor(match[1]).includes(match[2])
  );
}

/** Today as yyyy-mm-dd in local time, for the date input's `min`. */
export function todayIso(now: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** "14:30" → "14h30", "09:05" → "9h05". */
function frenchTime(time: string): string {
  const [hours, minutes] = time.split(":");
  return `${Number(hours)}h${minutes}`;
}

/** "Pour le mardi 20 octobre à 14h30", "À 14h30" or "Pas de date précise". */
export function wantedWhenLabel(
  request: Pick<WantedRequest, "wantedOn" | "wantedAt">,
): string {
  const day = request.wantedOn
    ? `Pour le ${format(parseISO(request.wantedOn), "EEEE d MMMM", { locale: fr })}`
    : "";
  const time = request.wantedAt ? frenchTime(request.wantedAt) : "";
  if (day && time) return `${day} à ${time}`;
  if (day) return day;
  if (time) return `À ${time}`;
  return "Pas de date précise";
}

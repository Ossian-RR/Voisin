/**
 * Flat references inside the residence, written X-Nn:
 * X = building part or tower (capital letter), N = floor number, n = door letter.
 * Example: "A-3a" is part A, 3rd floor, door a.
 */
const LOCATION_PATTERN = /^([A-Z])-(\d+)([a-z])$/;

export interface FlatLocation {
  part: string;
  floor: number;
  door: string;
}

export function parseLocation(ref: string): FlatLocation | undefined {
  const match = LOCATION_PATTERN.exec(ref);
  if (!match) return undefined;
  return { part: match[1], floor: Number(match[2]), door: match[3] };
}

/** Tidies what a neighbor types: "a - 3A" → "A-3a". The result may still be invalid. */
export function normalizeLocation(input: string): string {
  const compact = input.replace(/\s+/g, "");
  const match = /^([a-zA-Z])-?(\d+)([a-zA-Z])$/.exec(compact);
  if (!match) return compact;
  return `${match[1].toUpperCase()}-${Number(match[2])}${match[3].toLowerCase()}`;
}

export function isValidLocation(ref: string): boolean {
  return parseLocation(ref) !== undefined;
}

function floorLabel(floor: number): string {
  if (floor === 0) return "rez-de-chaussée";
  return floor === 1 ? "1er étage" : `${floor}e étage`;
}

/** Spelled out in French, e.g. "Bâtiment A, 3e étage, porte a". */
export function describeLocation(ref: string): string {
  const location = parseLocation(ref);
  if (!location) return ref;
  return `Bâtiment ${location.part}, ${floorLabel(location.floor)}, porte ${location.door}`;
}

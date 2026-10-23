/** Converts between Supabase rows and the app's types (see ./api.ts). */
import type {
  BorrowRequest,
  BorrowRequestStatus,
  Item,
  ItemPhoto,
  ItemStatus,
  NeighborProfile,
  Residence,
  WantedRequest,
} from "./api";
import type { Database, Json } from "./database.types";
import type { NewItemDraft } from "./new-item";
import { cleanProfile, displayName, isCivility } from "./profile";
import { isAllowedTime } from "./wanted";

type Tables = Database["public"]["Tables"];
type Row<T extends keyof Tables> = Tables[T]["Row"];
type Insert<T extends keyof Tables> = Tables[T]["Insert"];
type Person = Pick<Row<"profiles">, "civility" | "last_name" | "location">;

const PERSON = "civility, last_name, location";
export const ITEM_SELECT = `id, title, kind, status, description, condition, photos, created_at, owner_id, owner:profiles(${PERSON})`;
export const WANTED_SELECT = `id, text, wanted_on, wanted_at, created_at, author_id, author:profiles(${PERSON})`;
export const REQUEST_SELECT = `id, item_id, borrower_id, status, requested_from, requested_at, created_at, borrower:profiles(${PERSON}), item:items(${ITEM_SELECT})`;
export const ME_SELECT = `id, ${PERSON}, photo_path, admitted_on, residence:residences(id, name, address)`;

export type ItemRow = Pick<
  Row<"items">,
  | "id"
  | "title"
  | "kind"
  | "status"
  | "description"
  | "condition"
  | "photos"
  | "created_at"
  | "owner_id"
> & { owner: Person | null };
export type WantedRow = Pick<
  Row<"wanted_requests">,
  "id" | "text" | "wanted_on" | "wanted_at" | "created_at" | "author_id"
> & { author: Person | null };
export type RequestRow = Pick<
  Row<"borrow_requests">,
  | "id"
  | "item_id"
  | "borrower_id"
  | "status"
  | "requested_from"
  | "requested_at"
  | "created_at"
> & { borrower: Person | null; item: ItemRow | null };
export type MeRow = Person &
  Pick<Row<"profiles">, "id" | "photo_path" | "admitted_on"> & {
    residence: Pick<Row<"residences">, "id" | "name" | "address"> | null;
  };

const STATUSES: ItemStatus[] = ["available", "unavailable", "removed"];
const REQUEST_STATUSES: BorrowRequestStatus[] = [
  "pending",
  "approved",
  "declined",
  "returned",
];

/** Optional day and time; Postgres returns times as "14:30:00". */
function when(day: string | null, time: string | null) {
  return {
    ...(day ? { wantedOn: day } : {}),
    ...(time ? { wantedAt: time.slice(0, 5) } : {}),
  };
}

/** Day and time as stored: empty becomes null, a time outside the allowed slots is dropped. */
export function whenColumns(input: { wantedOn?: string; wantedAt?: string }) {
  return {
    day: input.wantedOn || null,
    time:
      input.wantedAt && isAllowedTime(input.wantedAt) ? input.wantedAt : null,
  };
}

/** "Madame Martin", or "Un voisin" when the profile can't be read. */
export function personName(person: Person | null): string {
  if (!person || !isCivility(person.civility)) return "Un voisin";
  return displayName({ civility: person.civility, lastName: person.last_name });
}

export function profileFromRow(row: Person): NeighborProfile | undefined {
  if (!isCivility(row.civility)) return undefined;
  return {
    civility: row.civility,
    lastName: row.last_name,
    location: row.location,
  };
}

export function residenceFromRow(
  row: MeRow["residence"],
): Residence | undefined {
  if (!row) return undefined;
  return {
    id: row.id,
    address: row.address,
    ...(row.name ? { name: row.name } : {}),
  };
}

/** Reads the `photos` column; ignores anything malformed. */
export function storedPhotos(value: Json): ItemPhoto[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const label = typeof entry.label === "string" ? entry.label : "Photo";
    const hue = typeof entry.hue === "number" ? entry.hue : 160;
    const path = typeof entry.path === "string" ? entry.path : undefined;
    return [{ label, hue, ...(path ? { path } : {}) }];
  });
}

/** Every photo path of these rows, to ask for links in one go. */
export function photoPaths(rows: Pick<Row<"items">, "photos">[]): string[] {
  return rows.flatMap((row) =>
    storedPhotos(row.photos).flatMap((photo) =>
      photo.path ? [photo.path] : [],
    ),
  );
}

/** `links` maps storage paths to short-lived links; others keep a placeholder. */
export function itemFromRow(
  row: ItemRow,
  links: ReadonlyMap<string, string>,
): Item {
  return {
    id: row.id,
    title: row.title,
    kind: row.kind === "gift" ? "gift" : "loan",
    status: STATUSES.includes(row.status as ItemStatus)
      ? (row.status as ItemStatus)
      : "unavailable",
    description: row.description,
    condition: row.condition === "Neuf" ? "Neuf" : "Bon état",
    ownerId: row.owner_id,
    ownerName: personName(row.owner),
    location: row.owner?.location ?? "",
    photos: storedPhotos(row.photos).map((photo) => {
      const src = photo.path ? links.get(photo.path) : undefined;
      return src ? { ...photo, src } : photo;
    }),
    createdAt: row.created_at,
  };
}

export function wantedFromRow(row: WantedRow): WantedRequest {
  return {
    id: row.id,
    authorId: row.author_id,
    authorName: personName(row.author),
    text: row.text,
    ...when(row.wanted_on, row.wanted_at),
    createdAt: row.created_at,
  };
}

export function requestFromRow(
  row: RequestRow,
  links: ReadonlyMap<string, string>,
): BorrowRequest {
  return {
    id: row.id,
    itemId: row.item_id,
    borrowerId: row.borrower_id,
    borrowerName: personName(row.borrower),
    borrowerLocation: row.borrower?.location ?? "",
    status: REQUEST_STATUSES.includes(row.status as BorrowRequestStatus)
      ? (row.status as BorrowRequestStatus)
      : "pending",
    ...when(row.requested_from, row.requested_at),
    createdAt: row.created_at,
    ...(row.item ? { item: itemFromRow(row.item, links) } : {}),
  };
}

/**
 * Where a photo goes in the "photos" bucket. The first folder must be the
 * neighbor's login id: storage rules only let them write there.
 */
export function itemPhotoPath(
  userId: string,
  itemId: string,
  index: number,
): string {
  return `${userId}/items/${itemId}/${index + 1}.jpg`;
}

export function avatarPath(userId: string): string {
  return `${userId}/avatar.jpg`;
}

/** The row to insert for a new item. Assumes the draft passed validation. */
export function newItemRow(
  draft: Pick<NewItemDraft, "isGift" | "title" | "description" | "condition">,
  ids: { itemId: string; ownerProfileId: string },
  photoPathsInOrder: string[],
): Insert<"items"> {
  return {
    id: ids.itemId,
    owner_id: ids.ownerProfileId,
    title: draft.title.trim(),
    kind: draft.isGift ? "gift" : "loan",
    description: draft.description.trim(),
    condition: draft.condition || "Bon état",
    photos: photoPathsInOrder.map((path, index) => ({
      path,
      label: `Photo ${index + 1}`,
      hue: 160,
    })),
  };
}

/**
 * The row for a new search. The text is kept as typed (only trimmed); an
 * empty text gives undefined. A time outside the allowed slots is dropped.
 */
export function newWantedRow(
  authorProfileId: string,
  input: { text: string; wantedOn?: string; wantedAt?: string },
): Insert<"wanted_requests"> | undefined {
  const text = input.text.trim();
  if (!text) return undefined;
  const { day, time } = whenColumns(input);
  return { author_id: authorProfileId, text, wanted_on: day, wanted_at: time };
}

/** The row for a new borrow request, with the wished day and time. */
export function newRequestRow(
  itemId: string,
  borrowerProfileId: string,
  input: { wantedOn?: string; wantedAt?: string },
): Insert<"borrow_requests"> {
  const { day, time } = whenColumns(input);
  return {
    item_id: itemId,
    borrower_id: borrowerProfileId,
    requested_from: day,
    requested_at: time,
  };
}

/** The row to create the first time a neighbor signs in (residence set by the database). */
export function newProfileRow(
  userId: string,
  profile: NeighborProfile,
): Insert<"profiles"> {
  const clean = cleanProfile(profile);
  return {
    user_id: userId,
    civility: clean.civility,
    last_name: clean.lastName,
    location: clean.location,
  };
}

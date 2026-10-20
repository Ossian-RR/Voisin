import type {
  Civility,
  Item,
  ItemCategory,
  ItemConditionChoice,
  ItemKind,
  ItemPhoto,
  ItemStatus,
} from "./api";
import type { Database, Json } from "./database.types";
import type { NewItemDraft } from "./new-item";
import { displayName } from "./wanted";

type ItemRow = Database["public"]["Tables"]["items"]["Row"];
type ItemInsert = Database["public"]["Tables"]["items"]["Insert"];
type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];

export type ItemOwner = Pick<
  ProfileRow,
  "civility" | "first_name" | "last_name" | "location"
>;

/** An `items` row read together with its owner's profile. */
export type ItemRowWithOwner = ItemRow & { owner: ItemOwner | null };

/** The columns to ask Supabase for, matching `ItemRowWithOwner`. */
export const ITEM_SELECT =
  "id, title, category, kind, status, description, condition, photos, created_at, owner_id, owner:profiles(civility, first_name, last_name, location)";

const CATEGORIES: ItemCategory[] = [
  "Tools",
  "Garden",
  "Cleaning",
  "Kitchen",
  "Outdoor",
];
const STATUSES: ItemStatus[] = ["available", "unavailable", "removed"];

/** How neighbors see the owner: first name when known, else "Madame Martin". */
export function ownerLabel(owner: ItemOwner | null): string {
  if (!owner) return "Un voisin";
  const first = owner.first_name?.trim();
  if (first) return first;
  return displayName({
    civility: owner.civility as Civility,
    lastName: owner.last_name,
    location: owner.location,
  });
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

/**
 * The app's item, from a database row. `photoLinks` maps storage paths to
 * short-lived links; photos without a link keep their colored placeholder.
 */
export function itemFromRow(
  row: ItemRowWithOwner,
  photoLinks: ReadonlyMap<string, string>,
): Item {
  return {
    id: row.id,
    title: row.title,
    ...(CATEGORIES.includes(row.category as ItemCategory)
      ? { category: row.category as ItemCategory }
      : {}),
    kind: row.kind === "gift" ? "gift" : ("loan" as ItemKind),
    status: STATUSES.includes(row.status as ItemStatus)
      ? (row.status as ItemStatus)
      : "unavailable",
    description: row.description,
    condition: (row.condition === "Neuf"
      ? "Neuf"
      : "Bon état") as ItemConditionChoice,
    ownerId: row.owner_id,
    ownerFirstName: ownerLabel(row.owner),
    location: row.owner?.location ?? "",
    photos: storedPhotos(row.photos).map((photo) => {
      const src = photo.path ? photoLinks.get(photo.path) : undefined;
      return src ? { ...photo, src } : photo;
    }),
    createdAt: row.created_at,
  };
}

/** Every photo path of these rows, to ask for links in one go. */
export function photoPaths(rows: Pick<ItemRow, "photos">[]): string[] {
  return rows.flatMap((row) =>
    storedPhotos(row.photos).flatMap((photo) =>
      photo.path ? [photo.path] : [],
    ),
  );
}

/**
 * Where an item photo goes in the "photos" bucket. The first folder must be
 * the neighbor's login id: storage rules only let them write there.
 */
export function itemPhotoPath(
  userId: string,
  itemId: string,
  index: number,
): string {
  return `${userId}/items/${itemId}/${index + 1}.jpg`;
}

/** The row to insert for a new item. Assumes the draft passed validation. */
export function newItemRow(
  draft: Pick<NewItemDraft, "isGift" | "title" | "description" | "condition">,
  ids: { itemId: string; ownerProfileId: string },
  photoPathsInOrder: string[],
  extra: { status?: ItemStatus; createdAt?: string } = {},
): ItemInsert {
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
    ...(extra.status ? { status: extra.status } : {}),
    ...(extra.createdAt ? { created_at: extra.createdAt } : {}),
  };
}

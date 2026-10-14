import type { Item, ItemConditionChoice, NeighborProfile } from "./api";
import { displayName } from "./wanted";

export const MIN_PHOTOS = 2;
export const MAX_PHOTOS = 5;
export const CONDITION_CHOICES: ItemConditionChoice[] = ["Bon état", "Neuf"];

export interface NewItemDraft {
  isGift: boolean;
  /** JPEG data URLs, in the order they were added. */
  photos: string[];
  title: string;
  description: string;
  condition: ItemConditionChoice | "";
}

export const EMPTY_DRAFT: NewItemDraft = {
  isGift: false,
  photos: [],
  title: "",
  description: "",
  condition: "",
};

export type NewItemErrors = Partial<
  Record<"photos" | "title" | "description" | "condition", string>
>;

export function validateNewItem(draft: NewItemDraft): NewItemErrors {
  const errors: NewItemErrors = {};
  const missing = MIN_PHOTOS - draft.photos.length;
  if (missing > 0) {
    errors.photos =
      missing === MIN_PHOTOS
        ? `Ajoutez au moins ${MIN_PHOTOS} photos.`
        : `Ajoutez encore ${missing} photo.`;
  }
  if (!draft.title.trim()) errors.title = "Donnez un titre à votre objet.";
  if (!draft.description.trim())
    errors.description = "Décrivez votre objet en quelques mots.";
  if (!draft.condition) errors.condition = "Indiquez l’état de l’objet.";
  return errors;
}

export function isGift(item: Pick<Item, "kind">): boolean {
  return item.kind === "gift";
}

/** Builds the item shown to neighbors. Assumes the draft passed validation. */
export function createUserItem(
  draft: NewItemDraft,
  owner: { id: string; profile: NeighborProfile },
  now: Date,
  id: string,
): Item {
  return {
    id,
    title: draft.title.trim(),
    kind: draft.isGift ? "gift" : "loan",
    status: "available",
    description: draft.description.trim(),
    condition: draft.condition as ItemConditionChoice,
    ownerId: owner.id,
    ownerFirstName: displayName(owner.profile),
    location: owner.profile.location,
    photos: draft.photos.map((src, index) => ({
      label: `Photo ${index + 1}`,
      hue: 160,
      src,
    })),
    createdAt: now.toISOString(),
  };
}

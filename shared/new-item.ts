import type { Item, ItemConditionChoice } from "./api";

export const MIN_PHOTOS = 2;
export const MAX_PHOTOS = 5;
/** Same bounds as the items checks in the database. */
export const MAX_DESCRIPTION = 2000;
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
  else if (draft.description.trim().length > MAX_DESCRIPTION)
    errors.description = `La description ne doit pas dépasser ${MAX_DESCRIPTION} caractères.`;
  if (!draft.condition) errors.condition = "Indiquez l’état de l’objet.";
  return errors;
}

export function isGift(item: Pick<Item, "kind">): boolean {
  return item.kind === "gift";
}

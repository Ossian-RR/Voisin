import { useMemo } from "react";
import type { Item } from "@shared/api";
import { items as sampleItems } from "@shared/mock";
import { createUserItem, type NewItemDraft } from "@shared/new-item";
import { CURRENT_USER_ID } from "./borrow-requests";
import { createLocalList, newId } from "./local-store";
import { readProfile } from "./profile";

/** Items posted from the app, kept in the browser until the database exists. */
const store = createLocalList<Item>("common-shed:items");

/** The neighbor's own items first (newest on top), then the sample items. */
export function useAllItems(): Item[] {
  const mine = store.useList();
  // New items are stored first, so the list is already newest first.
  return useMemo(() => [...mine, ...sampleItems], [mine]);
}

/** Returns the new item, or undefined when the browser could not store it. */
export function publishItem(draft: NewItemDraft): Item | undefined {
  const item = createUserItem(
    draft,
    { id: CURRENT_USER_ID, profile: readProfile() },
    new Date(),
    newId(),
  );
  const previous = store.read();
  if (store.write([item, ...previous])) return item;
  store.write(previous);
  return undefined;
}

export function removeMyItem(id: string) {
  store.write(store.read().filter((item) => item.id !== id));
}

export function isMine(item: Item): boolean {
  return item.ownerId === CURRENT_USER_ID;
}

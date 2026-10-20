import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { Item } from "@shared/api";
import {
  ITEM_SELECT,
  itemFromRow,
  itemPhotoPath,
  newItemRow,
  photoPaths,
  type ItemRowWithOwner,
} from "@shared/items-db";
import type { NewItemDraft } from "@shared/new-item";
import { useMe } from "./auth";
import { newId } from "./local-store";
import { supabase } from "./supabase";

export const ITEMS_KEY = ["items"];
const PHOTOS_BUCKET = "photos";
/** Photo links stay valid this long; the list is refreshed well before. */
const LINK_SECONDS = 60 * 60;

async function fetchItems(): Promise<Item[]> {
  const { data, error } = await supabase
    .from("items")
    .select(ITEM_SELECT)
    .order("created_at", { ascending: false })
    .returns<ItemRowWithOwner[]>();
  if (error) throw error;

  const paths = photoPaths(data);
  const links = new Map<string, string>();
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .createSignedUrls(paths, LINK_SECONDS);
    for (const entry of signed ?? []) {
      if (entry.path && entry.signedUrl) links.set(entry.path, entry.signedUrl);
    }
  }
  return data.map((row) => itemFromRow(row, links));
}

/** Every item of the residence, newest first, from Supabase. */
export function useItems() {
  return useQuery({
    queryKey: ITEMS_KEY,
    queryFn: fetchItems,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAllItems(): Item[] {
  return useItems().data ?? [];
}

/** True for the signed-in neighbor's own items. */
export function useIsMine(): (item: Pick<Item, "ownerId">) => boolean {
  const { profileId } = useMe();
  return useCallback((item) => item.ownerId === profileId, [profileId]);
}

async function uploadPhotos(
  userId: string,
  itemId: string,
  photos: string[],
): Promise<string[] | undefined> {
  const paths: string[] = [];
  for (const [index, dataUrl] of photos.entries()) {
    const path = itemPhotoPath(userId, itemId, index);
    const blob = await (await fetch(dataUrl)).blob();
    const { error } = await supabase.storage
      .from(PHOTOS_BUCKET)
      .upload(path, blob, { contentType: "image/jpeg", upsert: true });
    if (error) {
      await removePhotos(paths);
      return undefined;
    }
    paths.push(path);
  }
  return paths;
}

async function removePhotos(paths: string[]) {
  if (paths.length > 0) {
    await supabase.storage.from(PHOTOS_BUCKET).remove(paths);
  }
}

type Me = ReturnType<typeof useMe>;

/**
 * Uploads the photos, then saves the item. Returns false if anything failed
 * (nothing is left behind in that case).
 */
export async function saveNewItem(
  me: Me,
  draft: NewItemDraft,
  extra: { status?: Item["status"]; createdAt?: string } = {},
): Promise<boolean> {
  const itemId = newId();
  const paths = await uploadPhotos(me.userId, itemId, draft.photos);
  if (!paths) return false;
  const { error } = await supabase
    .from("items")
    .insert(
      newItemRow(draft, { itemId, ownerProfileId: me.profileId }, paths, extra),
    );
  if (error) {
    await removePhotos(paths);
    return false;
  }
  return true;
}

/** Publish and remove the signed-in neighbor's items; the list refreshes after. */
export function useMyItemActions() {
  const { userId, profileId } = useMe();
  const queryClient = useQueryClient();
  const refresh = useCallback(
    () => queryClient.invalidateQueries({ queryKey: ITEMS_KEY }),
    [queryClient],
  );

  const publishItem = useCallback(
    async (draft: NewItemDraft) => {
      const ok = await saveNewItem({ userId, profileId }, draft);
      if (ok) await refresh();
      return ok;
    },
    [userId, profileId, refresh],
  );

  const removeMyItem = useCallback(
    async (item: Item) => {
      const { error } = await supabase.from("items").delete().eq("id", item.id);
      if (error) return false;
      await removePhotos(
        item.photos.flatMap((photo) => (photo.path ? [photo.path] : [])),
      );
      await refresh();
      return true;
    },
    [refresh],
  );

  return { publishItem, removeMyItem, refresh };
}

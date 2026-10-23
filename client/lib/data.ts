/** Everything the app reads and writes in Supabase, as React Query hooks. */
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  BorrowRequestStatus,
  Item,
  ItemStatus,
  NeighborProfile,
} from "@shared/api";
import { itemStatusAfter } from "@shared/borrow";
import {
  ITEM_SELECT,
  REQUEST_SELECT,
  WANTED_SELECT,
  avatarPath,
  itemFromRow,
  itemPhotoPath,
  newItemRow,
  newRequestRow,
  newWantedRow,
  photoPaths,
  requestFromRow,
  wantedFromRow,
  type ItemRow,
  type RequestRow,
  type WantedRow,
} from "@shared/db";
import type { NewItemDraft } from "@shared/new-item";
import { cleanProfile } from "@shared/profile";
import { useAuth, useMe } from "./auth";
import { supabase } from "./supabase";

const BUCKET = "photos";
/** Photo links stay valid one hour; lists refresh well before. */
const LINK_SECONDS = 60 * 60;
const STALE = 60 * 1000;

/** Short-lived links for private photos, by path. */
async function photoLinks(paths: string[]): Promise<Map<string, string>> {
  const links = new Map<string, string>();
  if (paths.length === 0) return links;
  const { data } = await supabase.storage
    .from(BUCKET)
    .createSignedUrls(paths, LINK_SECONDS);
  for (const entry of data ?? []) {
    if (entry.path && entry.signedUrl) links.set(entry.path, entry.signedUrl);
  }
  return links;
}

async function upload(path: string, dataUrl: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, blob, { contentType: "image/jpeg", upsert: true });
  if (error) throw error;
}

async function removeFiles(paths: string[]) {
  if (paths.length > 0) await supabase.storage.from(BUCKET).remove(paths);
}

/** Throws the Supabase error so React Query reports it. */
function check<T>({ data, error }: { data: T; error: unknown }): T {
  if (error) throw error;
  return data;
}

// Items ----------------------------------------------------------------------

export function useItems() {
  return useQuery({
    queryKey: ["items"],
    staleTime: STALE,
    queryFn: async (): Promise<Item[]> => {
      const rows = check(
        await supabase
          .from("items")
          .select(ITEM_SELECT)
          .neq("status", "removed")
          .order("created_at", { ascending: false })
          .returns<ItemRow[]>(),
      );
      const links = await photoLinks(photoPaths(rows));
      return rows.map((row) => itemFromRow(row, links));
    },
  });
}

export function usePublishItem() {
  const { userId, profileId } = useMe();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (draft: NewItemDraft) => {
      const itemId = crypto.randomUUID();
      const paths = draft.photos.map((_, i) =>
        itemPhotoPath(userId, itemId, i),
      );
      try {
        await Promise.all(
          paths.map((path, i) => upload(path, draft.photos[i])),
        );
        check(
          await supabase
            .from("items")
            .insert(
              newItemRow(draft, { itemId, ownerProfileId: profileId }, paths),
            ),
        );
      } catch (error) {
        await removeFiles(paths);
        throw error;
      }
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["items"] }),
  });
}

export function useRemoveItem() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (item: Item) => {
      check(await supabase.from("items").delete().eq("id", item.id));
      await removeFiles(item.photos.flatMap((p) => (p.path ? [p.path] : [])));
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["items"] }),
  });
}

// Borrow requests ------------------------------------------------------------

/** Requests the neighbor sent and received (row security returns only those). */
export function useBorrowRequests() {
  return useQuery({
    queryKey: ["requests"],
    staleTime: STALE,
    queryFn: async () => {
      const rows = check(
        await supabase
          .from("borrow_requests")
          .select(REQUEST_SELECT)
          .order("created_at", { ascending: false })
          .returns<RequestRow[]>(),
      );
      const links = await photoLinks(
        photoPaths(rows.flatMap((row) => (row.item ? [row.item] : []))),
      );
      return rows.map((row) => requestFromRow(row, links));
    },
  });
}

function useRefreshRequests() {
  const client = useQueryClient();
  return () =>
    Promise.all([
      client.invalidateQueries({ queryKey: ["requests"] }),
      client.invalidateQueries({ queryKey: ["items"] }),
    ]);
}

export function useAskToBorrow() {
  const { profileId } = useMe();
  const onSuccess = useRefreshRequests();
  return useMutation({
    mutationFn: async (input: {
      item: Item;
      wantedOn?: string;
      wantedAt?: string;
    }) =>
      check(
        await supabase
          .from("borrow_requests")
          .insert(newRequestRow(input.item.id, profileId, input)),
      ),
    onSuccess,
  });
}

export function useCancelRequest() {
  const onSuccess = useRefreshRequests();
  return useMutation({
    mutationFn: async (requestId: string) =>
      check(
        await supabase.from("borrow_requests").delete().eq("id", requestId),
      ),
    onSuccess,
  });
}

/** The owner accepts, declines or marks returned; the item follows. */
export function useAnswerRequest() {
  const onSuccess = useRefreshRequests();
  return useMutation({
    mutationFn: async (input: {
      requestId: string;
      item: Pick<Item, "id" | "kind">;
      answer: BorrowRequestStatus;
    }) => {
      check(
        await supabase
          .from("borrow_requests")
          .update({ status: input.answer })
          .eq("id", input.requestId),
      );
      const status: ItemStatus | undefined = itemStatusAfter(
        input.answer,
        input.item,
      );
      if (status) {
        check(
          await supabase
            .from("items")
            .update({ status })
            .eq("id", input.item.id),
        );
      }
    },
    onSuccess,
  });
}

// Wanted requests ------------------------------------------------------------

export function useWantedRequests() {
  return useQuery({
    queryKey: ["wanted"],
    staleTime: STALE,
    queryFn: async () =>
      check(
        await supabase
          .from("wanted_requests")
          .select(WANTED_SELECT)
          .order("created_at", { ascending: false })
          .returns<WantedRow[]>(),
      ).map(wantedFromRow),
  });
}

export function usePublishWanted() {
  const { profileId } = useMe();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      text: string;
      wantedOn?: string;
      wantedAt?: string;
    }) => {
      const row = newWantedRow(profileId, input);
      if (!row) throw new Error("empty");
      return check(
        await supabase
          .from("wanted_requests")
          .insert(row)
          .select("id")
          .single(),
      ).id;
    },
    onSuccess: () => client.invalidateQueries({ queryKey: ["wanted"] }),
  });
}

export function useRemoveWanted() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) =>
      check(await supabase.from("wanted_requests").delete().eq("id", id)),
    onSuccess: () => client.invalidateQueries({ queryKey: ["wanted"] }),
  });
}

// My profile -----------------------------------------------------------------

/** Link to the signed-in neighbor's photo, if any. */
export function useMyPhoto() {
  const { photoPath } = useMe();
  return useQuery({
    queryKey: ["avatar", photoPath],
    enabled: Boolean(photoPath),
    staleTime: STALE * 30,
    queryFn: async () =>
      (await photoLinks([photoPath!])).get(photoPath!) ?? null,
  });
}

export function useSaveProfile() {
  const { profileId } = useMe();
  const { reload } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (profile: NeighborProfile) => {
      const clean = cleanProfile(profile);
      check(
        await supabase
          .from("profiles")
          .update({
            civility: clean.civility,
            last_name: clean.lastName,
            location: clean.location,
          })
          .eq("id", profileId),
      );
    },
    onSuccess: () => {
      reload();
      // Names and flats appear on items, requests and searches.
      return client.invalidateQueries();
    },
  });
}

/** Saves a new photo (data URL), or removes it with null. */
export function useSavePhoto() {
  const { userId, profileId, photoPath } = useMe();
  const { reload } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (dataUrl: string | null) => {
      const path = avatarPath(userId);
      if (dataUrl) await upload(path, dataUrl);
      check(
        await supabase
          .from("profiles")
          .update({ photo_path: dataUrl ? path : null })
          .eq("id", profileId),
      );
      if (!dataUrl && photoPath) await removeFiles([photoPath]);
    },
    onSuccess: () => {
      reload();
      return client.invalidateQueries({ queryKey: ["avatar"] });
    },
  });
}

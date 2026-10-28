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
  newProfileRow,
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
import { createLinkCache } from "@shared/link-cache";
import { cleanProfile } from "@shared/profile";
import { useAuth, useMe, useMember } from "./auth";
import { supabase } from "./supabase";

const BUCKET = "photos";
const HOUR = 60 * 60 * 1000;
/** Photo links last 6 hours and are reused until less than 1 hour is left. */
const LINK_MS = 6 * HOUR;
const links = createLinkCache(HOUR);
const STALE = 60 * 1000;

/** Links for private photos, by path. Known links are reused, so the browser keeps the images. */
async function photoLinks(paths: string[]): Promise<Map<string, string>> {
  const now = Date.now();
  const { found, missing } = links.lookup(paths, now);
  if (missing.length > 0) {
    const { data } = await supabase.storage
      .from(BUCKET)
      .createSignedUrls(missing, LINK_MS / 1000);
    for (const entry of data ?? []) {
      if (!entry.path || !entry.signedUrl) continue;
      links.store(entry.path, entry.signedUrl, now + LINK_MS);
      found.set(entry.path, entry.signedUrl);
    }
  }
  return found;
}

async function upload(path: string, dataUrl: string) {
  const blob = await (await fetch(dataUrl)).blob();
  const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
    contentType: "image/jpeg",
    upsert: true,
    // Let the browser keep photos a day; a replaced photo gets a new link.
    cacheControl: "86400",
  });
  if (error) throw error;
  links.forget(path);
}

async function removeFiles(paths: string[]) {
  if (paths.length === 0) return;
  await supabase.storage.from(BUCKET).remove(paths);
  paths.forEach(links.forget);
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
  const { userId, profileId } = useMember();
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
  const { profileId } = useMember();
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
  const { profileId } = useMember();
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

/** Creates the profile the first time, then updates it. Either way it is confirmed. */
export function useSaveProfile() {
  const { userId, profileId } = useMe();
  const { reload } = useAuth();
  const client = useQueryClient();
  return useMutation({
    mutationFn: async (profile: NeighborProfile) => {
      // Pressing « Enregistrer » confirms the profile (needed for Aide).
      const confirmed_at = new Date().toISOString();
      if (!profileId) {
        // The residence (if the admin already set one) is filled in by the database.
        check(
          await supabase
            .from("profiles")
            .insert(newProfileRow(userId, profile)),
        );
        check(
          await supabase
            .from("profiles")
            .update({ confirmed_at })
            .eq("user_id", userId),
        );
        return;
      }
      const clean = cleanProfile(profile);
      check(
        await supabase
          .from("profiles")
          .update({
            civility: clean.civility,
            last_name: clean.lastName,
            location: clean.location,
            confirmed_at,
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

// Help -----------------------------------------------------------------------

/** Sends a message to the admin; the database e-mails it (see help_messages). */
export function useSendHelp() {
  const { profileId } = useMe();
  return useMutation({
    mutationFn: async (input: {
      topic: string;
      message: string;
      replyEmail: string;
    }) =>
      check(
        await supabase.from("help_messages").insert({
          profile_id: profileId,
          topic: input.topic,
          message: input.message.trim(),
          reply_email: input.replyEmail.trim(),
        }),
      ),
  });
}

import type { NeighborProfile } from "@shared/api";
import { defaultNeighbor } from "@shared/mock";
import { cleanProfile, isNeighborProfile } from "@shared/profile";
import { createLocalValue } from "./local-store";

/** The neighbor's own profile, kept in the browser until accounts exist. */
const store = createLocalValue<NeighborProfile>(
  "common-shed:profile",
  defaultNeighbor,
  isNeighborProfile,
);

export const useProfile = store.useValue;
export const readProfile = store.read;

/** Saves the form fields and keeps the current photo. */
export function saveProfile(fields: Omit<NeighborProfile, "photo">) {
  store.write(cleanProfile({ ...fields, photo: store.read().photo }));
}

/** Saves or removes the photo right away, without touching the other fields. */
export function saveProfilePhoto(photo: string | undefined) {
  store.write(cleanProfile({ ...store.read(), photo }));
}

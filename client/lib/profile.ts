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

export function saveProfile(profile: NeighborProfile) {
  store.write(cleanProfile(profile));
}

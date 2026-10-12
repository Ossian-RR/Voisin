import type { WantedRequest } from "@shared/api";
import { createWantedRequest } from "@shared/wanted";
import { CURRENT_USER_ID } from "./borrow-requests";
import { createLocalList, newId } from "./local-store";
import { readProfile } from "./profile";

/** What the neighbor is looking for, kept in the browser until the database exists. */
const store = createLocalList<WantedRequest>("common-shed:wanted-requests");

export const useWantedRequests = store.useList;

export function publishWantedRequest(input: {
  text: string;
  wantedOn?: string;
  wantedAt?: string;
}) {
  const request = createWantedRequest(
    input,
    { id: CURRENT_USER_ID, profile: readProfile() },
    new Date(),
    newId(),
  );
  if (request) store.write([...store.read(), request]);
  return request;
}

export function removeWantedRequest(id: string) {
  store.write(store.read().filter((request) => request.id !== id));
}

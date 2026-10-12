import type { BorrowRequest, Item } from "@shared/api";
import { createBorrowRequest } from "@shared/borrow";
import { createLocalList, newId } from "./local-store";

/**
 * Borrow requests kept in the browser until the database is connected.
 * There are no accounts yet, so every request belongs to the same local user.
 */
export const CURRENT_USER_ID = "me";

const store = createLocalList<BorrowRequest>("common-shed:borrow-requests");

export const useBorrowRequests = store.useList;

export function sendBorrowRequest(item: Item): BorrowRequest {
  const request = createBorrowRequest(
    item,
    CURRENT_USER_ID,
    new Date(),
    newId(),
  );
  store.write([...store.read(), request]);
  return request;
}

export function cancelBorrowRequest(id: string) {
  store.write(store.read().filter((request) => request.id !== id));
}

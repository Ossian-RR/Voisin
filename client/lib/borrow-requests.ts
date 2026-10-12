import { useSyncExternalStore } from "react";
import type { BorrowRequest, Item } from "@shared/api";
import { createBorrowRequest } from "@shared/borrow";

/**
 * Borrow requests kept in the browser until the database is connected.
 * There are no accounts yet, so every request belongs to the same local user.
 */
export const CURRENT_USER_ID = "me";

const STORAGE_KEY = "common-shed:borrow-requests";
const EMPTY: BorrowRequest[] = [];

let cache: BorrowRequest[] | null = null;
const listeners = new Set<() => void>();

function read(): BorrowRequest[] {
  if (cache) return cache;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    cache = Array.isArray(parsed) ? (parsed as BorrowRequest[]) : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: BorrowRequest[]) {
  cache = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage blocked (private mode): keep the requests in memory for this visit.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY) return;
    cache = null;
    listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function useBorrowRequests(): BorrowRequest[] {
  return useSyncExternalStore(subscribe, read, () => EMPTY);
}

export function sendBorrowRequest(item: Item): BorrowRequest {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const request = createBorrowRequest(item, CURRENT_USER_ID, new Date(), id);
  write([...read(), request]);
  return request;
}

export function cancelBorrowRequest(id: string) {
  write(read().filter((request) => request.id !== id));
}

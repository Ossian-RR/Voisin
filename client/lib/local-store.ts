import { useSyncExternalStore } from "react";

/**
 * A value kept in the browser's localStorage until the database is connected.
 * Reads and writes never throw: if storage is blocked (private mode),
 * the value lives in memory for the current visit.
 */
export function createLocalValue<T>(
  storageKey: string,
  fallback: T,
  isValid: (value: unknown) => boolean,
) {
  let cache: T | undefined;
  const listeners = new Set<() => void>();

  function read(): T {
    if (cache !== undefined) return cache;
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed: unknown = raw ? JSON.parse(raw) : undefined;
      cache = isValid(parsed) ? (parsed as T) : fallback;
    } catch {
      cache = fallback;
    }
    return cache;
  }

  function write(next: T) {
    cache = next;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Storage blocked: keep the value in memory for this visit.
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      cache = undefined;
      listener();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  return {
    read,
    write,
    useValue: () => useSyncExternalStore(subscribe, read, () => fallback),
  };
}

export function createLocalList<T>(storageKey: string) {
  const store = createLocalValue<T[]>(storageKey, [], Array.isArray);
  return { read: store.read, write: store.write, useList: store.useValue };
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

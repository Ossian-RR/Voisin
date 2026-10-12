import { useSyncExternalStore } from "react";

/**
 * A list kept in the browser's localStorage until the database is connected.
 * Reads and writes never throw: if storage is blocked (private mode),
 * the list lives in memory for the current visit.
 */
export function createLocalList<T>(storageKey: string) {
  const empty: T[] = [];
  let cache: T[] | null = null;
  const listeners = new Set<() => void>();

  function read(): T[] {
    if (cache) return cache;
    try {
      const raw = localStorage.getItem(storageKey);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      cache = Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
      cache = [];
    }
    return cache;
  }

  function write(next: T[]) {
    cache = next;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      // Storage blocked: keep the list in memory for this visit.
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void) {
    listeners.add(listener);
    const onStorage = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      cache = null;
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
    useList: () => useSyncExternalStore(subscribe, read, () => empty),
  };
}

export function newId(): string {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

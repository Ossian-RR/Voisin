import { describe, it, expect } from "vitest";
import {
  REMEMBERED_EMAIL_KEY,
  readRememberedEmail,
  rememberEmail,
  type EmailStore,
} from "./remembered-email";

function fakeStore(): EmailStore & { values: Map<string, string> } {
  const values = new Map<string, string>();
  return {
    values,
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => void values.set(key, value),
  };
}

describe("remembered e-mail", () => {
  it("gives back the last address used", () => {
    const store = fakeStore();
    rememberEmail(store, "  marie@exemple.fr ");
    expect(readRememberedEmail(store)).toBe("marie@exemple.fr");
  });

  it("is empty on a phone never used", () => {
    expect(readRememberedEmail(fakeStore())).toBeUndefined();
    expect(readRememberedEmail(undefined)).toBeUndefined();
  });

  it("ignores an empty or invalid address", () => {
    const store = fakeStore();
    rememberEmail(store, "");
    rememberEmail(store, "marie");
    expect(store.values.size).toBe(0);
    store.values.set(REMEMBERED_EMAIL_KEY, "pas une adresse");
    expect(readRememberedEmail(store)).toBeUndefined();
  });

  it("survives a blocked storage", () => {
    const blocked: EmailStore = {
      getItem: () => {
        throw new Error("blocked");
      },
      setItem: () => {
        throw new Error("blocked");
      },
    };
    expect(() => rememberEmail(blocked, "marie@exemple.fr")).not.toThrow();
    expect(readRememberedEmail(blocked)).toBeUndefined();
  });
});

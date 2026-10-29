import { isValidEmail } from "./residence";

/** Where the phone keeps the last sign-in address, for « Bon retour ». */
export const REMEMBERED_EMAIL_KEY = "voisin.email";

/** The part of localStorage used here, so tests can pass a fake one. */
export type EmailStore = Pick<Storage, "getItem" | "setItem">;

/**
 * The last address used on this phone, or undefined. Storage can be missing
 * or blocked (private browsing): then the sign-in form simply starts empty.
 */
export function readRememberedEmail(store?: EmailStore): string | undefined {
  try {
    const value = store?.getItem(REMEMBERED_EMAIL_KEY)?.trim();
    return value && isValidEmail(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

/** Keeps the address for next time. Kept after « Se déconnecter » on purpose. */
export function rememberEmail(store: EmailStore | undefined, email?: string) {
  const value = email?.trim();
  if (!value || !isValidEmail(value)) return;
  try {
    store?.setItem(REMEMBERED_EMAIL_KEY, value);
  } catch {
    // Nothing to do: the address will just be typed again.
  }
}

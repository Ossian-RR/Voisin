import type { NeighborProfile } from "./api";
import type { Database } from "./database.types";
import { cleanProfile, isNeighborProfile } from "./profile";

type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

/** What Supabase Auth sends back when a sign-in link can't be sent. */
export interface AuthErrorLike {
  code?: string;
  status?: number;
}

/**
 * French message for a sign-in link request that failed. Voisin is invite
 * only, so an unknown address is refused instead of creating an account.
 */
export function signInErrorMessage(error: AuthErrorLike): string {
  switch (error.code) {
    case "otp_disabled":
    case "signup_disabled":
    case "user_not_found":
      return "Cette adresse n’a pas encore été invitée. Demandez une invitation à la personne qui gère Voisin.";
    case "email_address_invalid":
    case "validation_failed":
      return "Cette adresse e-mail n’est pas valide.";
    case "over_email_send_rate_limit":
    case "over_request_rate_limit":
      return "Trop de demandes. Patientez quelques minutes avant de redemander un lien.";
  }
  if (error.status === 429) {
    return "Trop de demandes. Patientez quelques minutes avant de redemander un lien.";
  }
  return "Le lien n’a pas pu être envoyé. Vérifiez votre connexion et réessayez.";
}

/**
 * When a sign-in link fails (expired, already used), Supabase comes back to
 * the app with the reason in the address, after "#". Returns a French
 * message, or undefined when the address carries no error.
 */
export function linkErrorMessage(hash: string): string | undefined {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const code = params.get("error_code");
  if (!code && !params.get("error")) return undefined;
  if (code === "otp_expired") {
    return "Ce lien a expiré ou a déjà servi. Demandez-en un nouveau.";
  }
  return "Ce lien de connexion ne fonctionne pas. Demandez-en un nouveau.";
}

/** The row to create in `profiles` the first time a neighbor signs in. */
export function newProfileRow(
  userId: string,
  profile: NeighborProfile,
): ProfileInsert {
  const clean = cleanProfile(profile);
  return {
    user_id: userId,
    civility: clean.civility,
    last_name: clean.lastName,
    location: clean.location,
  };
}

/** The app's profile shape, from a `profiles` row. Undefined if the row is odd. */
export function profileFromRow(
  row: Pick<ProfileRow, "civility" | "last_name" | "location">,
): NeighborProfile | undefined {
  const profile = {
    civility: row.civility,
    lastName: row.last_name,
    location: row.location,
  };
  return isNeighborProfile(profile) ? profile : undefined;
}

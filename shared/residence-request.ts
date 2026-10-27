import { isValidEmail } from "./residence";

/** What someone types to ask for Voisin in their residence. */
export interface ResidenceRequestDraft {
  contactName: string;
  email: string;
  address: string;
  /** Typed as text; empty or a whole number. */
  flats: string;
  message: string;
}

export const EMPTY_RESIDENCE_REQUEST: ResidenceRequestDraft = {
  contactName: "",
  email: "",
  address: "",
  flats: "",
  message: "",
};

export type ResidenceRequestErrors = Partial<
  Record<"contactName" | "email" | "address" | "flats", string>
>;

export function validateResidenceRequest(
  draft: ResidenceRequestDraft,
): ResidenceRequestErrors {
  const errors: ResidenceRequestErrors = {};
  if (!draft.contactName.trim()) errors.contactName = "Indiquez votre nom.";
  if (!isValidEmail(draft.email))
    errors.email = "Indiquez une adresse e-mail valide.";
  if (!draft.address.trim())
    errors.address = "Indiquez l’adresse de la résidence.";
  const flats = draft.flats.trim();
  if (flats && !(/^\d+$/.test(flats) && +flats >= 1 && +flats <= 2000))
    errors.flats = "Indiquez un nombre entre 1 et 2000, ou laissez vide.";
  return errors;
}

/** The row to insert in residence_requests. Assumes validation passed. */
export function residenceRequestRow(draft: ResidenceRequestDraft) {
  const flats = draft.flats.trim();
  return {
    contact_name: draft.contactName.trim(),
    email: draft.email.trim(),
    address: draft.address.trim(),
    flats: flats ? Number(flats) : null,
    message: draft.message.trim() || null,
  };
}

/** French message when the request was refused by the database. */
export function residenceRequestErrorMessage(error: { message?: string }) {
  if (error.message?.includes("already_requested"))
    return "Une demande a déjà été envoyée avec cette adresse e-mail aujourd’hui. Nous vous répondrons bientôt.";
  if (error.message?.includes("too_many_requests"))
    return "Trop de demandes en ce moment. Réessayez dans une heure.";
  return "La demande n’a pas pu être envoyée. Vérifiez votre connexion et réessayez.";
}

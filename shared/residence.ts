import type { Residence } from "./api";

/** "Résidence" is always shown, followed by the name when there is one. */
export function residenceTitle(residence: Pick<Residence, "name">): string {
  const name = residence.name?.trim();
  if (!name) return "Résidence";
  // The admin may have typed "Résidence Les Tilleuls": don't say it twice.
  return /^résidence\b/i.test(name) ? name : `Résidence ${name}`;
}

/** The "Envoyer" button of the Aide form turns active from this many characters. */
export const MIN_MESSAGE_LENGTH = 50;

export const HELP_TOPICS = [
  "Rejoindre une résidence existante",
  "Créer notre résidence",
  "Ajouter des voisins ou des étages",
  "Autre question",
] as const;

export type HelpTopic = (typeof HELP_TOPICS)[number];

/** Same number as private.limit_help_messages (supabase/migrations). */
export const HELP_MESSAGES_PER_DAY = 5;

/** French message when an Aide message could not be sent. */
export function helpErrorMessage(error: { message?: string }): string {
  if (error.message?.includes("too_many_help_messages"))
    return `Vous avez déjà envoyé ${HELP_MESSAGES_PER_DAY} messages aujourd’hui. Réessayez demain : nous lisons ceux déjà reçus.`;
  return "Vérifiez votre connexion internet, puis réessayez.";
}

/** Simple check for the reply address typed in the Aide form. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

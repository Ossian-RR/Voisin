import type { Residence } from "./api";

/** "Résidence" is always shown, followed by the name when there is one. */
export function residenceTitle(residence: Pick<Residence, "name">): string {
  const name = residence.name?.trim();
  return name ? `Résidence ${name}` : "Résidence";
}

/** The "Envoyer" button of the Aide form turns active from this many characters. */
export const MIN_MESSAGE_LENGTH = 50;

export const HELP_TOPICS = [
  "Créer notre résidence",
  "Ajouter des voisins ou des étages",
  "Autre question",
] as const;

export type HelpTopic = (typeof HELP_TOPICS)[number];

/** Simple check for the reply address typed in the Aide form. */
export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim());
}

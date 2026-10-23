import type { Residence } from "./api";

/** "Résidence" is always shown, followed by the name when there is one. */
export function residenceTitle(residence: Pick<Residence, "name">): string {
  const name = residence.name?.trim();
  return name ? `Résidence ${name}` : "Résidence";
}

/**
 * Person who runs the app: creates the residence, buildings, floors and
 * neighbors, and designates an administrator. Messages from the Aide tab go
 * to this address. While it is empty, the e-mail opens without a recipient.
 */
export const APP_MANAGER = {
  email: "",
};

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

/** Builds the mailto: link for the Aide form. */
export function helpMailto(
  to: string,
  topic: HelpTopic,
  message: string,
  from: { name: string; location: string; email?: string },
  residence: Pick<Residence, "name" | "address">,
): string {
  const subject = `[${residenceTitle(residence)} · ${residence.address}] ${topic}`;
  const body = [
    message.trim(),
    "",
    "—",
    `${from.name}, logement ${from.location}`,
    `${residenceTitle(residence)}, ${residence.address}`,
    ...(from.email?.trim() ? [`Me répondre à : ${from.email.trim()}`] : []),
  ].join("\n");
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

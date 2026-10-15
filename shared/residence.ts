export interface Residence {
  /** Optional: many residences have no name. */
  name?: string;
  address: string;
}

export const RESIDENCE: Residence = {
  address: "333 rue des Pyrénées",
};

/** "Résidence" is always shown, followed by the name when there is one. */
export function residenceTitle(residence: Residence): string {
  const name = residence.name?.trim();
  return name ? `Résidence ${name}` : "Résidence";
}

/**
 * Person who runs the app: creates the residence, buildings, floors and
 * neighbors, and designates an administrator. Messages from the Aide tab go
 * to this address. Leave empty until it is known: the form then says so.
 */
export const APP_MANAGER = {
  email: "",
};

export const HELP_TOPICS = [
  "Créer notre résidence",
  "Ajouter des voisins ou des étages",
  "Désigner un administrateur",
  "Autre question",
] as const;

export type HelpTopic = (typeof HELP_TOPICS)[number];

/** Builds the mailto: link for the Aide form. */
export function helpMailto(
  to: string,
  topic: HelpTopic,
  message: string,
  from: { name: string; location: string },
  residence: Residence,
): string {
  const subject = `[${residenceTitle(residence)} · ${residence.address}] ${topic}`;
  const body = [
    message.trim(),
    "",
    "—",
    `${from.name}, logement ${from.location}`,
    `${residenceTitle(residence)}, ${residence.address}`,
  ].join("\n");
  return `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

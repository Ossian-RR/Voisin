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

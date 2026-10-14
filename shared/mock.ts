import type { Item, ItemCategory, ItemPhoto, NeighborProfile } from "./api";

export const CATEGORIES: ("All" | ItemCategory)[] = [
  "All",
  "Tools",
  "Garden",
  "Cleaning",
  "Kitchen",
  "Outdoor",
];

/** French labels shown in the UI. The English keys stay as stable ids. */
export const CATEGORY_LABELS: Record<"All" | ItemCategory, string> = {
  All: "Tous",
  Tools: "Outils",
  Garden: "Jardin",
  Cleaning: "Ménage",
  Kitchen: "Cuisine",
  Outdoor: "Extérieur",
};

const photosFor = (hue: number): ItemPhoto[] => [
  { label: "Vue de face", hue },
  { label: "Gros plan", hue: hue + 18 },
  { label: "Accessoires", hue: hue - 12 },
];

export const items: Item[] = [
  {
    id: "pressure-cleaner",
    title: "Nettoyeur haute pression",
    category: "Cleaning",
    status: "available",
    description:
      "Idéal pour les allées, le mobilier de jardin et les abris vélo. Fourni avec un tuyau de 5 m, une buse turbo et une lance à mousse. Merci de le rendre rincé et sec. Révisé au printemps.",
    condition: "Bon état",
    ownerId: "anna",
    ownerFirstName: "Anna",
    location: "A-3a",
    photos: photosFor(196),
  },
  {
    id: "cordless-drill",
    title: "Perceuse sans fil avec coffret d’embouts",
    category: "Tools",
    status: "available",
    description:
      "Perceuse-visseuse 18 V avec une batterie de rechange et un coffret de 60 embouts pour le bois, le métal et la maçonnerie. Chargeur fourni.",
    condition: "Bon état",
    ownerId: "marc",
    ownerFirstName: "Marc",
    location: "A-1c",
    photos: photosFor(28),
  },
  {
    id: "three-step-ladder",
    title: "Escabeau trois marches",
    category: "Tools",
    status: "unavailable",
    description:
      "Escabeau en aluminium, charge maximale 150 kg. Actuellement prêté à un voisin pour le week-end. Patins antidérapants.",
    condition: "Bon état",
    ownerId: "sofia",
    ownerFirstName: "Sofia",
    location: "B-4b",
    photos: photosFor(150),
  },
  {
    id: "lawn-aerator",
    title: "Aérateur de pelouse manuel",
    category: "Garden",
    status: "available",
    description:
      "Aérateur à pointes pour les pelouses tassées. À utiliser une ou deux fois par an, après la pluie. Poignées resserrées.",
    condition: "Bon état",
    ownerId: "tom",
    ownerFirstName: "Tom",
    location: "B-0a",
    photos: photosFor(100),
  },
  {
    id: "stand-mixer",
    title: "Robot pâtissier",
    category: "Kitchen",
    status: "available",
    description:
      "Robot pâtissier de cinq litres avec crochet pétrisseur, fouet et batteur plat. Parfait pour le pain et les grandes quantités de pâte à gâteau. Bol et tous les accessoires inclus.",
    condition: "Bon état",
    ownerId: "priya",
    ownerFirstName: "Priya",
    location: "A-2d",
    photos: photosFor(330),
  },
  {
    id: "wet-dry-vacuum",
    title: "Aspirateur eau et poussière",
    category: "Cleaning",
    status: "available",
    description:
      "Aspirateur d’atelier de vingt litres pour le garage, les liquides renversés et les feuilles. Suceur plat inclus. Filtre changé récemment.",
    condition: "Bon état",
    ownerId: "leo",
    ownerFirstName: "Leo",
    location: "C-5b",
    photos: photosFor(210),
  },
  {
    id: "hedge-trimmer",
    title: "Taille-haie électrique",
    category: "Garden",
    status: "unavailable",
    description:
      "Taille-haie léger de 600 mm avec interrupteur de sécurité. Prêté jusqu’à la fin du mois. Lame fraîchement aiguisée.",
    condition: "Bon état",
    ownerId: "hannah",
    ownerFirstName: "Hannah",
    location: "C-2a",
    photos: photosFor(80),
  },
  {
    id: "trestle-tables",
    title: "Tables pliantes sur tréteaux (x2)",
    category: "Outdoor",
    status: "available",
    description:
      "Deux tables pliantes de 1,80 m pour les fêtes de quartier, les pique-niques et les trocs de graines. Les pieds se verrouillent bien.",
    condition: "Bon état",
    ownerId: "omar",
    ownerFirstName: "Omar",
    location: "B-1c",
    photos: photosFor(15),
  },
  {
    id: "moving-boxes",
    title: "Cartons de déménagement (x10)",
    kind: "gift",
    category: "Outdoor",
    status: "available",
    description:
      "Dix cartons solides, déjà pliés, après notre emménagement. À récupérer quand vous voulez.",
    condition: "Bon état",
    ownerId: "ines",
    ownerFirstName: "Inès",
    location: "A-0b",
    photos: photosFor(40),
  },
  {
    id: "old-bike-pump",
    title: "Pompe à vélo",
    category: "Outdoor",
    status: "removed",
    description: "Retiré par son propriétaire.",
    condition: "Bon état",
    ownerId: "leo",
    ownerFirstName: "Leo",
    location: "C-5b",
    photos: photosFor(240),
  },
];

/** Profile used until the neighbor saves their own on the Profil page. */
export const defaultNeighbor: NeighborProfile = {
  civility: "Madame",
  lastName: "Martin",
  location: "B-2c",
};

export function visibleItems(all: Item[]): Item[] {
  return all.filter((item) => item.status !== "removed");
}

export function findItem(
  all: Item[],
  id: string | undefined,
): Item | undefined {
  return all.find((item) => item.id === id && item.status !== "removed");
}

import type { FoodRequest, Item, ItemCategory, ItemPhoto } from "./api";

export const CATEGORIES: ("All" | ItemCategory)[] = [
  "All",
  "Tools",
  "Garden",
  "Cleaning",
  "Kitchen",
  "Outdoor",
];

const photosFor = (hue: number): ItemPhoto[] => [
  { label: "Front view", hue },
  { label: "Close-up", hue: hue + 18 },
  { label: "Accessories", hue: hue - 12 },
];

export const items: Item[] = [
  {
    id: "pressure-cleaner",
    title: "High-pressure cleaner",
    category: "Cleaning",
    status: "available",
    description:
      "Great for driveways, patio furniture and bike sheds. Comes with a 5 m hose, a turbo nozzle and a foam lance. Please return it rinsed and dry.",
    condition: "Very good. Serviced in spring.",
    ownerId: "anna",
    ownerFirstName: "Anna",
    distance: "120 m",
    photos: photosFor(196),
  },
  {
    id: "cordless-drill",
    title: "Cordless drill with bit set",
    category: "Tools",
    status: "available",
    description:
      "18 V drill driver with a spare battery and a 60-piece bit set for wood, metal and masonry.",
    condition: "Good. Charger included.",
    ownerId: "marc",
    ownerFirstName: "Marc",
    distance: "80 m",
    photos: photosFor(28),
  },
  {
    id: "three-step-ladder",
    title: "Three-step ladder",
    category: "Tools",
    status: "unavailable",
    description:
      "Aluminium step ladder with a 150 kg rating. Currently lent to a neighbor for the weekend.",
    condition: "Good. Non-slip feet.",
    ownerId: "sofia",
    ownerFirstName: "Sofia",
    distance: "210 m",
    photos: photosFor(150),
  },
  {
    id: "lawn-aerator",
    title: "Manual lawn aerator",
    category: "Garden",
    status: "available",
    description:
      "Spike-style aerator for compacted lawns. Best used once or twice a year after rain.",
    condition: "Good. Handles tightened.",
    ownerId: "tom",
    ownerFirstName: "Tom",
    distance: "140 m",
    photos: photosFor(100),
  },
  {
    id: "stand-mixer",
    title: "Stand mixer",
    category: "Kitchen",
    status: "available",
    description:
      "Five-litre stand mixer with dough hook, whisk and paddle. Ideal for bread and big cake batches.",
    condition: "Very good. Bowl and all attachments included.",
    ownerId: "priya",
    ownerFirstName: "Priya",
    distance: "60 m",
    photos: photosFor(330),
  },
  {
    id: "wet-dry-vacuum",
    title: "Wet and dry vacuum",
    category: "Cleaning",
    status: "available",
    description:
      "Twenty-litre workshop vacuum for garages, spills and leaves. Includes a crevice tool.",
    condition: "Good. Filter recently replaced.",
    ownerId: "leo",
    ownerFirstName: "Leo",
    distance: "260 m",
    photos: photosFor(210),
  },
  {
    id: "hedge-trimmer",
    title: "Electric hedge trimmer",
    category: "Garden",
    status: "unavailable",
    description:
      "Lightweight 600 mm trimmer with a safety switch. Lent out until the end of the month.",
    condition: "Good. Blade freshly sharpened.",
    ownerId: "hannah",
    ownerFirstName: "Hannah",
    distance: "190 m",
    photos: photosFor(80),
  },
  {
    id: "trestle-tables",
    title: "Folding trestle tables (x2)",
    category: "Outdoor",
    status: "available",
    description:
      "Two 1.8 m folding tables for street parties, picnics and seed swaps.",
    condition: "Good. Legs lock firmly.",
    ownerId: "omar",
    ownerFirstName: "Omar",
    distance: "95 m",
    photos: photosFor(15),
  },
  {
    id: "old-bike-pump",
    title: "Bike pump",
    category: "Outdoor",
    status: "removed",
    description: "Removed by the owner.",
    condition: "Good.",
    ownerId: "leo",
    ownerFirstName: "Leo",
    distance: "260 m",
    photos: photosFor(240),
  },
];

export const foodRequests: FoodRequest[] = [
  {
    id: "eggs",
    title: "Eggs, half a dozen",
    note: "Baking for a school bake sale. A dozen back next week.",
    neededBy: "Today, 6 pm",
    requesterFirstName: "Yusuf",
    distance: "70 m",
  },
  {
    id: "butter",
    title: "Butter, 100 g",
    note: "Only need a small amount for pancakes.",
    neededBy: "Tomorrow, morning",
    requesterFirstName: "Nadia",
    distance: "180 m",
  },
  {
    id: "oat-milk",
    title: "Oat milk, one carton",
    note: "Ran out before the shop opens.",
    neededBy: "Today",
    requesterFirstName: "Ben",
    distance: "110 m",
  },
];

export function visibleItems(all: Item[]): Item[] {
  return all.filter((item) => item.status !== "removed");
}

export function findItem(all: Item[], id: string | undefined): Item | undefined {
  return all.find((item) => item.id === id && item.status !== "removed");
}

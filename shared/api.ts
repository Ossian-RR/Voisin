/** Types the app works with. Database rows are converted in ./db.ts. */

export type Civility = "Monsieur" | "Madame" | "Famille";
export type ItemStatus = "available" | "unavailable" | "removed";
/** "loan": lent and returned. "gift": given away for good. */
export type ItemKind = "loan" | "gift";
export type ItemConditionChoice = "Neuf" | "Bon état";
export type BorrowRequestStatus =
  "pending" | "approved" | "declined" | "returned";

export interface Residence {
  id: string;
  name?: string;
  address: string;
}

export interface NeighborProfile {
  civility: Civility;
  lastName: string;
  /** Flat reference X-Nn, e.g. "A-3a". */
  location: string;
}

export interface ItemPhoto {
  label: string;
  hue: number;
  /** A data URL before publishing, then a short-lived link. Missing: colored placeholder. */
  src?: string;
  /** Where the photo is kept in the "photos" storage bucket. */
  path?: string;
}

export interface Item {
  id: string;
  title: string;
  kind: ItemKind;
  status: ItemStatus;
  description: string;
  condition: ItemConditionChoice;
  ownerId: string;
  /** "Madame Martin". */
  ownerName: string;
  /** The owner's flat. */
  location: string;
  photos: ItemPhoto[];
  createdAt: string;
}

/** Something a neighbor is looking for, typed freely. */
export interface WantedRequest {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  /** yyyy-mm-dd. */
  wantedOn?: string;
  /** HH:mm. */
  wantedAt?: string;
  createdAt: string;
}

export interface BorrowRequest {
  id: string;
  itemId: string;
  borrowerId: string;
  borrowerName: string;
  borrowerLocation: string;
  status: BorrowRequestStatus;
  createdAt: string;
  /** Missing if the item is no longer visible. */
  item?: Item;
}

/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

export type ItemStatus = "available" | "unavailable" | "removed";

export type ItemCategory = "Tools" | "Garden" | "Cleaning" | "Kitchen" | "Outdoor";

export interface ItemPhoto {
  label: string;
  hue: number;
  /** Real photo as a JPEG data URL. Sample items only have a colored placeholder. */
  src?: string;
}

/** "loan": lent and returned. "gift": given away for good. */
export type ItemKind = "loan" | "gift";

export type ItemConditionChoice = "Neuf" | "Bon état";

export interface Item {
  id: string;
  title: string;
  /** Missing for items posted from the app (the form has no category). */
  category?: ItemCategory;
  /** Defaults to "loan" when missing. */
  kind?: ItemKind;
  status: ItemStatus;
  description: string;
  condition: string;
  ownerId: string;
  ownerFirstName: string;
  /** Owner's flat, written X-Nn: building part, floor number, door letter (e.g. "A-3a"). */
  location: string;
  photos: ItemPhoto[];
  /** ISO date-time, for items posted from the app. */
  createdAt?: string;
}

export type Civility = "Monsieur" | "Madame" | "Famille";

export interface NeighborProfile {
  civility: Civility;
  lastName: string;
  /** Flat reference X-Nn, e.g. "A-3a". */
  location: string;
  /** Profile photo as a small JPEG data URL. Optional. */
  photo?: string;
}

/** Something a neighbor is looking for, typed freely. */
export interface WantedRequest {
  id: string;
  authorId: string;
  /** Shown to neighbors, e.g. "Madame Martin". */
  authorName: string;
  text: string;
  /** Wished borrowing date, yyyy-mm-dd. Optional. */
  wantedOn?: string;
  /** Wished time, HH:mm. Optional. */
  wantedAt?: string;
  createdAt: string;
}

export type BorrowRequestStatus = "pending" | "approved" | "declined" | "returned";

export interface BorrowRequest {
  id: string;
  itemId: string;
  borrowerId: string;
  status: BorrowRequestStatus;
  /** ISO date-time when the borrower sent the request. */
  createdAt: string;
  /** Pickup and return dates, agreed later with the owner. */
  requestedFrom?: string;
  requestedUntil?: string;
}

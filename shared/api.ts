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
}

export interface Item {
  id: string;
  title: string;
  category: ItemCategory;
  status: ItemStatus;
  description: string;
  condition: string;
  ownerId: string;
  ownerFirstName: string;
  distance: string;
  photos: ItemPhoto[];
}

export interface FoodRequest {
  id: string;
  title: string;
  note: string;
  neededBy: string;
  requesterFirstName: string;
  distance: string;
}

export type BorrowRequestStatus = "pending" | "approved" | "declined" | "returned";

export interface BorrowRequest {
  id: string;
  itemId: string;
  borrowerId: string;
  status: BorrowRequestStatus;
  requestedFrom: string;
  requestedUntil: string;
}

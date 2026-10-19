import type { BorrowRequest, Item } from "./api";

/** A request still in progress: it blocks sending a second one for the same item. */
export function isOpenRequest(request: BorrowRequest): boolean {
  return request.status === "pending" || request.status === "approved";
}

export function findOpenRequest(
  requests: BorrowRequest[],
  itemId: string,
  borrowerId: string,
): BorrowRequest | undefined {
  return requests.find(
    (request) =>
      request.itemId === itemId &&
      request.borrowerId === borrowerId &&
      isOpenRequest(request),
  );
}

export function canRequest(
  item: Item,
  requests: BorrowRequest[],
  borrowerId: string,
): boolean {
  return (
    item.status === "available" &&
    !findOpenRequest(requests, item.id, borrowerId)
  );
}

export function createBorrowRequest(
  item: Item,
  borrowerId: string,
  now: Date,
  id: string,
): BorrowRequest {
  return {
    id,
    itemId: item.id,
    borrowerId,
    status: "pending",
    createdAt: now.toISOString(),
  };
}

/** Newest first, as shown on the requests page. */
export function sortRequests<T extends { createdAt: string }>(
  requests: T[],
): T[] {
  return [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

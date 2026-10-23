import type {
  BorrowRequest,
  BorrowRequestStatus,
  Item,
  ItemStatus,
} from "./api";

/** A request still in progress: it blocks sending a second one for the same item. */
export function isOpenRequest(request: Pick<BorrowRequest, "status">): boolean {
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

/** A neighbor can ask for someone else's available item, once at a time. */
export function canRequest(
  item: Item,
  requests: BorrowRequest[],
  borrowerId: string,
): boolean {
  return (
    item.status === "available" &&
    item.ownerId !== borrowerId &&
    !findOpenRequest(requests, item.id, borrowerId)
  );
}

/**
 * What the item becomes when the owner answers a request: lent out when
 * approved (a gift leaves the list for good), back when returned.
 */
export function itemStatusAfter(
  answer: BorrowRequestStatus,
  item: Pick<Item, "kind">,
): ItemStatus | undefined {
  if (answer === "approved")
    return item.kind === "gift" ? "removed" : "unavailable";
  if (answer === "returned") return "available";
  return undefined;
}

/** Newest first, as shown on the requests page. */
export function sortRequests<T extends { createdAt: string }>(
  requests: T[],
): T[] {
  return [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

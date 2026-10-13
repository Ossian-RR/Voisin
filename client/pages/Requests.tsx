import { Link } from "react-router-dom";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ChevronLeft, DoorOpen, Inbox } from "lucide-react";
import { toast } from "sonner";
import type { BorrowRequest, BorrowRequestStatus } from "@shared/api";
import { sortRequests } from "@shared/borrow";
import { findItem } from "@shared/mock";
import { isGift } from "@shared/new-item";
import { useAllItems } from "@/lib/items";
import { ItemImage } from "@/components/items/ItemImage";
import {
  CURRENT_USER_ID,
  cancelBorrowRequest,
  useBorrowRequests,
} from "@/lib/borrow-requests";
import { PageHeader } from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

const statusStyles: Record<
  BorrowRequestStatus,
  { label: string; className: string; dot: string }
> = {
  pending: {
    label: "En attente",
    className: "bg-warning-soft text-warning",
    dot: "bg-warning",
  },
  approved: {
    label: "Acceptée",
    className: "bg-success-soft text-success",
    dot: "bg-success",
  },
  declined: {
    label: "Refusée",
    className: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  returned: {
    label: "Rendu",
    className: "bg-secondary text-secondary-foreground",
    dot: "bg-primary",
  },
};

export default function Requests() {
  const requests = sortRequests(
    useBorrowRequests().filter(
      (request) => request.borrowerId === CURRENT_USER_ID,
    ),
  );

  return (
    <section className="flex flex-1 flex-col">
      <div className="px-5 pt-4">
        <Link
          to="/profile"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Profil
        </Link>
      </div>
      <PageHeader title="Mes demandes" className="pt-2">
        Les objets que vous avez demandés à vos voisins.
      </PageHeader>
      <div className="flex flex-1 flex-col px-5">
        {requests.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="mt-5 space-y-3">
            {requests.map((request) => (
              <li key={request.id}>
                <RequestCard request={request} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function RequestCard({ request }: { request: BorrowRequest }) {
  const item = findItem(useAllItems(), request.itemId);
  const status = statusStyles[request.status];

  const handleCancel = () => {
    cancelBorrowRequest(request.id);
    toast("Demande annulée");
  };

  return (
    <article className="flex gap-3 rounded-2xl border border-border bg-card p-3">
      {item ? (
        <Link to={`/items/${item.id}`} className="shrink-0">
          <ItemImage
            category={item.category}
            hue={item.photos[0]?.hue ?? 160}
            label={item.title}
            className="size-20 rounded-xl [&>span:last-child]:size-10 [&>span:last-child>svg]:size-5"
          />
        </Link>
      ) : (
        <div className="size-20 shrink-0 rounded-xl bg-muted" />
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <p className="min-w-0 font-bold leading-snug">
            {item ? (
              <Link to={`/items/${item.id}`} className="hover:underline">
                {item.title}
              </Link>
            ) : (
              "Objet retiré par son propriétaire"
            )}
          </p>
          <span
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold",
              status.className,
            )}
          >
            <span className={cn("size-1.5 rounded-full", status.dot)} />
            {status.label}
          </span>
        </div>

        {item && (
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <DoorOpen className="size-3.5 shrink-0" aria-hidden />
            {isGift(item) ? "Donné par" : "Prêté par"} {item.ownerFirstName} ·{" "}
            {item.location}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <p className="text-xs text-muted-foreground">
            Envoyée le{" "}
            {format(new Date(request.createdAt), "d MMMM 'à' HH'h'mm", {
              locale: fr,
            })}
          </p>
          {request.status === "pending" && (
            <button
              type="button"
              onClick={handleCancel}
              className="shrink-0 text-xs font-bold text-destructive underline-offset-2 hover:underline"
            >
              Annuler
            </button>
          )}
        </div>
      </div>
    </article>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center py-16 text-center">
      <span className="grid size-16 place-items-center rounded-2xl bg-secondary text-secondary-foreground">
        <Inbox className="size-7" />
      </span>
      <p className="font-display mt-5 text-xl font-extrabold">
        Aucune demande pour l’instant
      </p>
      <p className="mt-2 max-w-[18rem] text-sm leading-relaxed text-muted-foreground">
        Trouvez un objet chez vos voisins et appuyez sur « Demander à emprunter
        ».
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
      >
        Parcourir les objets
      </Link>
    </div>
  );
}

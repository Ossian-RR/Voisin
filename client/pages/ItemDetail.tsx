import { useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ChevronLeft, CircleCheck, Clock, DoorOpen, Handshake } from "lucide-react";
import { ItemImage } from "@/components/items/ItemImage";
import { StatusBadge } from "@/components/items/StatusBadge";
import { toast } from "sonner";
import { CURRENT_USER_ID, sendBorrowRequest, useBorrowRequests } from "@/lib/borrow-requests";
import { cn } from "@/lib/utils";
import { canRequest, findOpenRequest } from "@shared/borrow";
import { describeLocation } from "@shared/location";
import { CATEGORY_LABELS, findItem, items } from "@shared/mock";

export default function ItemDetail() {
  const { id } = useParams();
  const item = findItem(items, id);

  if (!item) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <p className="font-display text-2xl font-extrabold">Objet introuvable</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Son propriétaire l’a peut-être retiré.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex h-11 items-center gap-1.5 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
        >
          <ChevronLeft className="size-4" />
          Retour aux objets
        </Link>
      </div>
    );
  }

  return <ItemDetailContent item={item} />;
}

function ItemDetailContent({ item }: { item: NonNullable<ReturnType<typeof findItem>> }) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const requests = useBorrowRequests();
  const isAvailable = item.status === "available";
  const requestSent = Boolean(findOpenRequest(requests, item.id, CURRENT_USER_ID));

  const handleAskToBorrow = () => {
    if (!canRequest(item, requests, CURRENT_USER_ID)) return;
    sendBorrowRequest(item);
    toast.success(`Demande envoyée à ${item.ownerFirstName}`, {
      description: "Vous la retrouvez dans vos demandes.",
    });
  };

  const handleCarouselScroll = () => {
    const el = carouselRef.current;
    if (!el || el.clientWidth === 0) return;
    setActivePhoto(Math.round(el.scrollLeft / el.clientWidth));
  };

  const goToPhoto = (index: number) => {
    const el = carouselRef.current;
    if (!el) return;
    el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
  };

  return (
    <article className="flex flex-col pb-6">
      <div className="px-5 pt-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
          Tous les objets
        </Link>
      </div>

      <section aria-label="Photos" className="px-5 pt-3">
        <div className="relative overflow-hidden rounded-3xl border border-border">
          <div
            ref={carouselRef}
            onScroll={handleCarouselScroll}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto scroll-smooth"
          >
            {item.photos.map((photo) => (
              <ItemImage
                key={photo.label}
                category={item.category}
                hue={photo.hue}
                label={`${item.title}, ${photo.label}`}
                className="aspect-[4/3] w-full shrink-0 snap-start"
              />
            ))}
          </div>
          <span className="absolute top-3 right-3 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-bold text-background">
            {activePhoto + 1} / {item.photos.length}
          </span>
          <span className="absolute bottom-3 left-3 rounded-full bg-background/90 px-2.5 py-1 text-xs font-semibold">
            {item.photos[activePhoto]?.label}
          </span>
        </div>

        <div className="mt-3 flex justify-center gap-1.5">
          {item.photos.map((photo, index) => (
            <button
              key={photo.label}
              type="button"
              aria-label={`Voir la photo ${index + 1}`}
              aria-current={index === activePhoto}
              onClick={() => goToPhoto(index)}
              className={cn(
                "h-1.5 rounded-full transition-all",
                index === activePhoto ? "w-5 bg-primary" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>
      </section>

      <section className="px-5 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={item.status} />
          <span className="rounded-full bg-secondary px-2.5 py-1 text-[11px] font-bold text-secondary-foreground">
            {CATEGORY_LABELS[item.category]}
          </span>
        </div>
        <h1 className="font-display mt-3 text-[28px] leading-[1.1] font-extrabold tracking-tight">
          {item.title}
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <DoorOpen className="size-4 shrink-0" aria-hidden />
          <span>
            <abbr title={describeLocation(item.location)} className="no-underline">
              {item.location}
            </abbr>{" "}
            · Prêté par {item.ownerFirstName}
          </span>
        </p>
      </section>

      <section
        aria-label="Disponibilité"
        className={cn(
          "mx-5 mt-5 flex gap-3 rounded-2xl p-4",
          isAvailable ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
        )}
      >
        {isAvailable ? (
          <CircleCheck className="mt-0.5 size-5 shrink-0" />
        ) : (
          <Clock className="mt-0.5 size-5 shrink-0" />
        )}
        <div className="min-w-0">
          <p className="font-bold">
            {isAvailable ? "Disponible au prêt" : "Prêté pour le moment"}
          </p>
          <p className="mt-0.5 text-sm text-foreground/75">
            {isAvailable
              ? `Demandez à ${item.ownerFirstName} un moment qui vous arrange pour le récupérer.`
              : "Il redeviendra disponible dès qu’il sera rendu."}
          </p>
        </div>
      </section>

      <section className="mt-6 space-y-5 px-5">
        <div>
          <h2 className="font-display text-lg font-extrabold">À propos de cet objet</h2>
          <p className="mt-2 text-[15px] leading-relaxed text-foreground/80">{item.description}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <p className="text-xs font-bold tracking-wider text-muted-foreground uppercase">État</p>
          <p className="mt-1 text-[15px]">{item.condition}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary font-display text-lg font-bold text-secondary-foreground">
            {item.ownerFirstName.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="font-semibold">{item.ownerFirstName}</p>
            <p className="text-sm text-muted-foreground">{describeLocation(item.location)}</p>
          </div>
        </div>
      </section>

      <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 mt-8 bg-background/95 px-5 pt-3 pb-2 backdrop-blur-md">
        <button
          type="button"
          disabled={!isAvailable || requestSent}
          onClick={handleAskToBorrow}
          className={cn(
            "flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-bold transition-colors duration-300",
            isAvailable && !requestSent
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.99]"
              : "cursor-not-allowed bg-muted text-muted-foreground",
          )}
        >
          {requestSent ? (
            <CircleCheck className="size-5" />
          ) : (
            <Handshake className="size-5" />
          )}
          {requestSent
            ? "Demande envoyée"
            : isAvailable
              ? "Demander à emprunter"
              : "Indisponible pour le moment"}
        </button>
        {requestSent && (
          <p className="mt-2 text-center text-xs text-muted-foreground">
            {item.ownerFirstName} va vous répondre.{" "}
            <Link to="/requests" className="font-semibold text-primary underline-offset-2 hover:underline">
              Voir mes demandes
            </Link>
          </p>
        )}
      </div>
    </article>
  );
}

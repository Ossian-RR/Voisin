import { useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ChevronLeft,
  CircleCheck,
  DoorOpen,
  Gift,
  Handshake,
  Trash2,
} from "lucide-react";
import { ItemImage } from "@/components/items/ItemImage";
import { StatusBadge } from "@/components/items/StatusBadge";
import { toast } from "sonner";
import {
  CURRENT_USER_ID,
  sendBorrowRequest,
  useBorrowRequests,
} from "@/lib/borrow-requests";
import { useDocumentTitle } from "@/components/layout/PageHeader";
import { useIsMine, useItems, useMyItemActions } from "@/lib/items";
import { cn } from "@/lib/utils";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { canRequest, findOpenRequest } from "@shared/borrow";
import { describeLocation } from "@shared/location";
import { findItem } from "@shared/mock";
import { isGift } from "@shared/new-item";

export default function ItemDetail() {
  const { id } = useParams();
  const { data, isPending, isError, refetch } = useItems();
  const item = findItem(data ?? [], id);

  if (isPending) {
    return (
      <p className="px-5 py-16 text-center text-sm text-muted-foreground">
        Chargement de l’objet…
      </p>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <p className="font-display text-2xl font-extrabold">
          Connexion impossible
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          Vérifiez votre connexion internet.
        </p>
        <button
          type="button"
          onClick={() => void refetch()}
          className="mt-6 inline-flex h-11 items-center rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
        <p className="font-display text-2xl font-extrabold">
          Objet introuvable
        </p>
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

function ItemDetailContent({
  item,
}: {
  item: NonNullable<ReturnType<typeof findItem>>;
}) {
  const carouselRef = useRef<HTMLDivElement>(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const requests = useBorrowRequests();
  const isAvailable = item.status === "available";
  const requestSent = Boolean(
    findOpenRequest(requests, item.id, CURRENT_USER_ID),
  );
  const gift = isGift(item);
  const mine = useIsMine()(item);
  const { removeMyItem } = useMyItemActions();
  const navigate = useNavigate();
  useDocumentTitle(item.title);

  const handleRemove = async () => {
    if (!(await removeMyItem(item))) {
      toast.error("L’objet n’a pas pu être retiré", {
        description: "Vérifiez votre connexion internet, puis réessayez.",
      });
      return;
    }
    toast("Objet retiré", {
      description: "Il n’apparaît plus chez vos voisins.",
    });
    navigate("/");
  };

  const handleAskToBorrow = () => {
    if (!canRequest(item, requests, CURRENT_USER_ID)) return;
    sendBorrowRequest(item);
    toast.success(`Demande envoyée à ${item.ownerFirstName}`, {
      description: "Suivez-la depuis votre profil, dans « Mes demandes ».",
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
                src={photo.src}
                label={`${item.title}, ${photo.label}`}
                className="aspect-[4/3] w-full shrink-0 snap-start"
              />
            ))}
          </div>
          <span className="absolute top-3 right-3 rounded-full bg-foreground/70 px-2.5 py-1 text-xs font-bold text-background">
            {activePhoto + 1} / {item.photos.length}
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
          <StatusBadge status={item.status} kind={item.kind} />
        </div>
        <h1 className="font-display mt-3 text-[28px] leading-[1.1] font-extrabold tracking-tight">
          {item.title}
        </h1>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <DoorOpen className="size-4 shrink-0" aria-hidden />
          <span>
            <abbr
              title={describeLocation(item.location)}
              className="no-underline"
            >
              {item.location}
            </abbr>{" "}
            · {gift ? "Donné par" : "Prêté par"} {item.ownerFirstName}
          </span>
        </p>
      </section>

      <section className="mt-5 space-y-5 px-5">
        <p className="text-[15px] leading-relaxed text-foreground/80">
          {item.description}{" "}
          <span className="font-semibold text-foreground">
            État : {item.condition}.
          </span>
        </p>
        <div className="flex items-center gap-3">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-secondary font-display text-lg font-bold text-secondary-foreground">
            {item.ownerFirstName.charAt(0)}
          </span>
          <div className="min-w-0">
            <p className="font-semibold">{item.ownerFirstName}</p>
            <p className="text-sm text-muted-foreground">
              {describeLocation(item.location)}
            </p>
          </div>
        </div>
      </section>

      {mine ? (
        <>
          <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-20 mt-8 bg-background/95 px-5 pt-3 pb-2 backdrop-blur-md">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <button
                  type="button"
                  className="flex h-14 w-full items-center justify-center gap-2 rounded-2xl border border-destructive/40 bg-card text-base font-bold text-destructive transition-colors hover:bg-destructive/5"
                >
                  <Trash2 className="size-5" />
                  Retirer cet objet
                </button>
              </AlertDialogTrigger>
              <AlertDialogContent className="max-w-[calc(100vw-2rem)] rounded-3xl sm:max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Retirer « {item.title} » ?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    Vos voisins ne le verront plus. Cette action est définitive.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleRemove}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Retirer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </>
      ) : (
        <>
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
              ) : gift ? (
                <Gift className="size-5" />
              ) : (
                <Handshake className="size-5" />
              )}
              {requestSent
                ? "Demande envoyée"
                : isAvailable
                  ? gift
                    ? "Je le veux"
                    : "Demander à emprunter"
                  : "Emprunté en ce moment"}
            </button>
            {requestSent && (
              <p className="mt-2 text-center text-xs text-muted-foreground">
                {item.ownerFirstName} va vous répondre.{" "}
                <Link
                  to="/requests"
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Voir mes demandes
                </Link>
              </p>
            )}
          </div>
        </>
      )}
    </article>
  );
}

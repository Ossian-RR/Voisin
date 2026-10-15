import { useRef, useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import {
  Camera,
  ShieldCheck,
  ChevronDown,
  ChevronRight,
  DoorOpen,
  Inbox,
  MapPin,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import type { Item, NeighborProfile } from "@shared/api";
import { isGift } from "@shared/new-item";
import { sortRequests } from "@shared/borrow";
import { describeLocation, isValidLocation } from "@shared/location";
import {
  cleanProfile,
  hasFieldChanges,
  validateProfile,
  type ProfileErrors,
} from "@shared/profile";
import { RESIDENCE, residenceTitle } from "@shared/residence";
import { CIVILITIES, displayName } from "@shared/wanted";
import { CURRENT_USER_ID } from "@/lib/borrow-requests";
import { isMine, useAllItems } from "@/lib/items";
import { ItemImage } from "@/components/items/ItemImage";
import { StatusBadge } from "@/components/items/StatusBadge";
import { toAvatarDataUrl } from "@/lib/image";
import { saveProfile, saveProfilePhoto, useProfile } from "@/lib/profile";
import { PageHeader } from "@/components/layout/PageHeader";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { useWantedRequests } from "@/lib/wanted-requests";

const fieldClass =
  "mt-2 h-12 w-full rounded-2xl border bg-background px-4 text-base focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40";

export default function Profile() {
  const profile = useProfile();
  const [draft, setDraft] = useState<NeighborProfile>(profile);
  const [errors, setErrors] = useState<ProfileErrors>({});

  const myItems = useAllItems().filter(isMine);
  const searches = sortRequests(
    useWantedRequests().filter(
      (request) => request.authorId === CURRENT_USER_ID,
    ),
  );

  const isDirty = hasFieldChanges(draft, profile);
  const photoInput = useRef<HTMLInputElement>(null);

  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      saveProfilePhoto(await toAvatarDataUrl(file));
      toast.success("Photo de profil mise à jour");
    } catch {
      toast.error("Impossible de lire cette image", {
        description: "Essayez avec une autre photo.",
      });
    }
  };

  const handleRemovePhoto = () => {
    saveProfilePhoto(undefined);
    toast("Photo retirée");
  };

  const update = (patch: Partial<NeighborProfile>) => {
    setDraft((current) => ({ ...current, ...patch }));
    setErrors({});
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateProfile(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    const { civility, lastName, location, isAdmin } = draft;
    saveProfile({ civility, lastName, location, isAdmin });
    setDraft(cleanProfile(draft));
    toast.success("Profil enregistré");
  };

  return (
    <div className="flex flex-col">
      <PageHeader title="Profil" />
      <div className="flex flex-col px-5 pt-3">
        <section className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => photoInput.current?.click()}
            aria-label={
              profile.photo
                ? "Changer la photo de profil"
                : "Ajouter une photo de profil"
            }
            className="relative size-16 shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:outline-none"
          >
            {profile.photo ? (
              <img
                src={profile.photo}
                alt=""
                className="size-full rounded-full object-cover"
              />
            ) : (
              <span className="grid size-full place-items-center rounded-full bg-primary font-display text-2xl font-extrabold text-primary-foreground">
                {profile.lastName.charAt(0).toUpperCase() || "?"}
              </span>
            )}
            <span className="absolute -right-0.5 -bottom-0.5 grid size-6 place-items-center rounded-full border-2 border-background bg-apricot text-apricot-foreground">
              <Camera className="size-3.5" aria-hidden />
            </span>
          </button>
          <input
            ref={photoInput}
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="sr-only"
            tabIndex={-1}
            aria-hidden
          />
          <div className="min-w-0">
            <p className="font-display truncate text-2xl leading-tight font-extrabold tracking-tight">
              {displayName(profile)}
            </p>
            {profile.isAdmin && (
              <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-0.5 text-[11px] font-bold text-primary-foreground">
                <ShieldCheck className="size-3" aria-hidden />
                Administrateur
              </span>
            )}
            {isValidLocation(profile.location) && (
              <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
                <DoorOpen className="size-4 shrink-0" aria-hidden />
                <span className="truncate">
                  <span className="font-semibold text-foreground">
                    {profile.location}
                  </span>{" "}
                  · {describeLocation(profile.location)}
                </span>
              </p>
            )}
            <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
              <MapPin className="size-4 shrink-0 text-apricot" aria-hidden />
              <span className="truncate">
                {residenceTitle(RESIDENCE)} · {RESIDENCE.address}
              </span>
            </p>
            {profile.photo && (
              <button
                type="button"
                onClick={handleRemovePhoto}
                className="mt-1 text-xs font-bold text-destructive underline-offset-2 hover:underline"
              >
                Retirer la photo
              </button>
            )}
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-6 rounded-3xl border border-border bg-card p-4 shadow-sm"
        >
          <h2 className="font-display text-lg font-extrabold">
            Mes informations
          </h2>

          <div className="mt-4 flex items-end gap-2">
            <div className="relative shrink-0">
              <select
                aria-label="Civilité"
                value={draft.civility}
                onChange={(event) =>
                  update({
                    civility: event.target.value as NeighborProfile["civility"],
                  })
                }
                className="h-12 appearance-none rounded-2xl border border-border bg-background pr-9 pl-4 text-base font-semibold focus:border-primary focus:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
              >
                {CIVILITIES.map((civility) => (
                  <option key={civility} value={civility}>
                    {civility}
                  </option>
                ))}
              </select>
              <ChevronDown
                className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
            </div>
            <div className="min-w-0 flex-1">
              <label
                htmlFor="profile-last-name"
                className="block text-sm font-bold"
              >
                Nom
              </label>
              <input
                id="profile-last-name"
                value={draft.lastName}
                onChange={(event) => update({ lastName: event.target.value })}
                autoComplete="family-name"
                aria-invalid={Boolean(errors.lastName)}
                aria-describedby={
                  errors.lastName ? "profile-last-name-error" : undefined
                }
                className={cn(
                  fieldClass,
                  "w-full",
                  errors.lastName
                    ? "border-destructive"
                    : "border-border focus:border-primary",
                )}
              />
            </div>
          </div>
          {errors.lastName && (
            <p
              id="profile-last-name-error"
              className="mt-1.5 text-xs font-semibold text-destructive"
            >
              {errors.lastName}
            </p>
          )}

          <label
            htmlFor="profile-location"
            className="mt-4 block text-sm font-bold"
          >
            Logement
          </label>
          <p
            id="profile-location-hint"
            className="text-xs text-muted-foreground"
          >
            Bâtiment, étage, porte. Par exemple A-3a.
          </p>
          <input
            id="profile-location"
            value={draft.location}
            onChange={(event) => update({ location: event.target.value })}
            autoComplete="off"
            autoCapitalize="characters"
            spellCheck={false}
            aria-invalid={Boolean(errors.location)}
            aria-describedby={
              errors.location
                ? "profile-location-hint profile-location-error"
                : "profile-location-hint"
            }
            className={cn(
              fieldClass,
              errors.location
                ? "border-destructive"
                : "border-border focus:border-primary",
            )}
          />
          {errors.location && (
            <p
              id="profile-location-error"
              className="mt-1.5 text-xs font-semibold text-destructive"
            >
              {errors.location}
            </p>
          )}

          <label
            htmlFor="profile-admin"
            className="mt-4 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-background p-3"
          >
            <Checkbox
              id="profile-admin"
              checked={Boolean(draft.isAdmin)}
              onCheckedChange={(checked) =>
                update({ isAdmin: checked === true })
              }
              className="mt-0.5"
            />
            <span className="min-w-0">
              <span className="block text-sm font-bold">Administrateur</span>
              <span className="block text-xs text-muted-foreground">
                Désigné par le responsable de l’app pour gérer la résidence.
              </span>
            </span>
          </label>

          <button
            type="submit"
            disabled={!isDirty}
            className={cn(
              "mt-5 flex h-12 w-full items-center justify-center rounded-2xl text-base font-bold transition-colors",
              isDirty
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 active:scale-[0.99]"
                : "cursor-not-allowed bg-muted text-muted-foreground",
            )}
          >
            Enregistrer
          </button>
        </form>

        <section aria-labelledby="activity-heading" className="mt-6">
          <h2
            id="activity-heading"
            className="font-display text-lg font-extrabold"
          >
            Mon activité
          </h2>
          <div className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
            <h3 className="flex items-center justify-between px-4 pt-3.5 pb-2 font-semibold">
              Mes objets
              <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
                {myItems.length}
              </span>
            </h3>
            {myItems.length > 0 ? (
              <ul className="divide-y divide-border">
                {myItems.map((item) => (
                  <li key={item.id}>
                    <MyItemRow item={item} />
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 pb-4 text-sm text-muted-foreground">
                Vous ne mettez encore aucun objet à disposition.{" "}
                <Link
                  to="/add"
                  className="font-semibold text-primary underline-offset-2 hover:underline"
                >
                  Ajouter un objet
                </Link>
              </div>
            )}
          </div>
          <ul className="mt-3 overflow-hidden rounded-2xl border border-border bg-card">
            <li>
              <ActivityLink
                to={searches.length > 0 ? "/" : "/search"}
                state={
                  searches.length > 0
                    ? { showWanted: searches[0].id }
                    : undefined
                }
                icon={Search}
                label="Mes recherches"
                count={searches.length}
              />
            </li>
          </ul>
        </section>
      </div>
    </div>
  );
}

function ActivityLink({
  to,
  state,
  icon: Icon,
  label,
  count,
}: {
  to: string;
  state?: unknown;
  icon: typeof Inbox;
  label: string;
  count: number;
}) {
  return (
    <Link
      to={to}
      state={state}
      className="flex items-center gap-3 px-4 py-3.5 hover:bg-secondary/60"
    >
      <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground">
        <Icon className="size-4.5" aria-hidden />
      </span>
      <span className="min-w-0 flex-1 font-semibold">{label}</span>
      <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-bold text-muted-foreground">
        {count}
      </span>
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </Link>
  );
}

function MyItemRow({ item }: { item: Item }) {
  const cover = item.photos[0];
  return (
    <Link
      to={`/items/${item.id}`}
      className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/60"
    >
      <ItemImage
        category={item.category}
        hue={cover?.hue ?? 160}
        src={cover?.src}
        label={item.title}
        className="size-12 shrink-0 rounded-xl [&>span:last-child]:size-8 [&>span:last-child>svg]:size-4"
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate font-semibold">{item.title}</span>
        <span className="block text-xs text-muted-foreground">
          {isGift(item) ? "Don" : "Prêt"} · {item.condition}
        </span>
      </span>
      <StatusBadge status={item.status} kind={item.kind} className="shrink-0" />
      <ChevronRight
        className="size-4 shrink-0 text-muted-foreground"
        aria-hidden
      />
    </Link>
  );
}

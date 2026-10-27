import { useState, type ChangeEvent, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import type { NeighborProfile } from "@shared/api";
import { describeLocation } from "@shared/location";
import {
  displayName,
  hasFieldChanges,
  validateProfile,
  type ProfileErrors,
} from "@shared/profile";
import { residenceTitle } from "@shared/residence";
import { ItemCard } from "@/components/items/ItemCard";
import { PageHeader } from "@/components/layout/PageHeader";
import { ProfileFields } from "@/components/ProfileFields";
import { useAuth, useMe } from "@/lib/auth";
import { useItems, useMyPhoto, useSavePhoto, useSaveProfile } from "@/lib/data";
import { toAvatarDataUrl } from "@/lib/image";
import { card, primaryButton, secondaryButton } from "@/lib/styles";

export default function Profile() {
  const me = useMe();
  const { signOut } = useAuth();
  const photo = useMyPhoto().data;
  const savePhoto = useSavePhoto();
  const saveProfile = useSaveProfile();
  const myItems = (useItems().data ?? []).filter(
    (i) => i.ownerId === me.profileId,
  );
  const [draft, setDraft] = useState<NeighborProfile>(me.profile);
  const [errors, setErrors] = useState<ProfileErrors>({});

  const handlePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    try {
      await savePhoto.mutateAsync(await toAvatarDataUrl(file));
      toast.success("Photo mise à jour");
    } catch {
      toast.error("La photo n’a pas pu être enregistrée");
    }
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validateProfile(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    saveProfile.mutate(draft, {
      onSuccess: () => toast.success("Profil enregistré"),
      onError: () => toast.error("Le profil n’a pas pu être enregistré"),
    });
  };

  return (
    <div className="flex flex-col gap-5 px-5">
      <PageHeader title="Profil" className="px-0" />
      <section className="flex items-center gap-4">
        <label className="relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-full bg-primary text-primary-foreground">
          {photo ? (
            <img src={photo} alt="" className="size-full object-cover" />
          ) : (
            <span className="grid size-full place-items-center text-2xl font-extrabold">
              {me.profile.lastName.charAt(0).toUpperCase()}
            </span>
          )}
          <input
            type="file"
            accept="image/*"
            onChange={handlePhoto}
            className="sr-only"
          />
          <span className="sr-only">Changer la photo de profil</span>
        </label>
        <div className="min-w-0 text-sm">
          <p className="font-display text-xl font-extrabold">
            {displayName(me.profile)}
          </p>
          <p className="text-muted-foreground">
            {me.profile.location} · {describeLocation(me.profile.location)}
          </p>
          <p className="text-muted-foreground">
            {residenceTitle(me.residence)} · {me.residence.address}
          </p>
          {photo && (
            <button
              type="button"
              onClick={() => savePhoto.mutate(null)}
              className="text-xs font-bold text-destructive"
            >
              Retirer la photo
            </button>
          )}
        </div>
      </section>

      <form onSubmit={handleSubmit} noValidate className={`${card} space-y-4`}>
        <h2 className="font-display text-lg font-extrabold">
          Mes informations
        </h2>
        {!me.confirmed && (
          <p className="text-sm text-muted-foreground">
            Vérifiez vos informations puis appuyez sur « Enregistrer » : c’est
            nécessaire pour écrire à l’Aide.
          </p>
        )}
        <ProfileFields
          value={draft}
          errors={errors}
          onChange={(patch) => {
            setDraft((d) => ({ ...d, ...patch }));
            setErrors({});
          }}
        />
        <button
          type="submit"
          disabled={
            (me.confirmed && !hasFieldChanges(draft, me.profile)) ||
            saveProfile.isPending
          }
          className={primaryButton}
        >
          Enregistrer
        </button>
      </form>

      <section className="space-y-2">
        <h2 className="font-display text-lg font-extrabold">Mes objets</h2>
        {myItems.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {myItems.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Aucun objet pour l’instant.{" "}
            <Link to="/add" className="font-bold text-primary">
              Prêter un objet
            </Link>
          </p>
        )}
      </section>

      <section className={`${card} space-y-2 text-sm`}>
        <h2 className="font-display text-lg font-extrabold">Mon compte</h2>
        <p>
          Connecté avec <strong>{me.email}</strong>
        </p>
        <p className="text-muted-foreground">
          Voisin depuis le {new Date(me.admittedOn).toLocaleDateString("fr-FR")}
        </p>
        <Link to="/help" className={secondaryButton}>
          Aide
        </Link>
        <button
          type="button"
          onClick={() => void signOut()}
          className={`${secondaryButton} text-destructive`}
        >
          Se déconnecter
        </button>
      </section>
    </div>
  );
}

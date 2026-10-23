import { useState, type FormEvent } from "react";
import type { NeighborProfile } from "@shared/api";
import { validateProfile, type ProfileErrors } from "@shared/profile";
import { AuthScreen, authButtonClass } from "@/components/auth/AuthScreen";
import { FieldError, ProfileFields } from "@/components/ProfileFields";
import { useAuth } from "@/lib/auth";

/** First sign-in: the neighbor tells who they are and where they live. */
export default function Welcome() {
  const { createProfile, signOut } = useAuth();
  const [draft, setDraft] = useState<NeighborProfile>({
    civility: "Madame",
    lastName: "",
    location: "",
  });
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [saving, setSaving] = useState(false);
  const [failed, setFailed] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validateProfile(draft);
    setErrors(found);
    if (Object.keys(found).length > 0) return;
    setSaving(true);
    const ok = await createProfile(draft);
    setSaving(false);
    setFailed(!ok);
  };

  return (
    <AuthScreen
      title="Bienvenue sur Voisin"
      intro="Présentez-vous à vos voisins : ils verront votre nom et votre logement à côté de vos objets."
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        <ProfileFields
          value={draft}
          errors={errors}
          onChange={(patch) => {
            setDraft((d) => ({ ...d, ...patch }));
            setErrors({});
          }}
        />
        {failed && (
          <FieldError text="Votre profil n’a pas pu être enregistré. Vérifiez votre connexion et réessayez." />
        )}
        <button type="submit" disabled={saving} className={authButtonClass}>
          {saving ? "Enregistrement…" : "Entrer dans Voisin"}
        </button>
        <button
          type="button"
          onClick={() => void signOut()}
          className="h-11 w-full text-sm font-bold text-muted-foreground"
        >
          Se déconnecter
        </button>
      </form>
    </AuthScreen>
  );
}

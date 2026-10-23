import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { hideSplash } from "@/lib/splash";
import SignIn from "@/pages/SignIn";
import Welcome from "@/pages/Welcome";
import { AuthScreen, authButtonClass } from "./AuthScreen";

/**
 * Shows the app only to signed-in neighbors with a profile in a residence.
 * The opening screen stays up while the saved session is checked.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { state, reload, signOut } = useAuth();
  const checking = state.status === "loading";

  useEffect(() => {
    if (!checking) hideSplash();
  }, [checking]);

  const signOutButton = (
    <button
      type="button"
      onClick={() => void signOut()}
      className="mt-3 h-11 w-full rounded-2xl text-sm font-bold text-muted-foreground"
    >
      Se déconnecter
    </button>
  );

  switch (state.status) {
    case "loading":
      return null;
    case "signed-out":
      return <SignIn />;
    case "needs-profile":
      return <Welcome />;
    case "no-residence":
      return (
        <AuthScreen
          title="Aucune résidence"
          intro="Votre invitation n’est rattachée à aucune résidence. Demandez à la personne qui gère Voisin de vous ajouter à la vôtre."
        >
          <button type="button" onClick={reload} className={authButtonClass}>
            Réessayer
          </button>
          {signOutButton}
        </AuthScreen>
      );
    case "error":
      return (
        <AuthScreen
          title="Connexion impossible"
          intro="Votre profil n’a pas pu être chargé. Vérifiez votre connexion internet et réessayez."
        >
          <button type="button" onClick={reload} className={authButtonClass}>
            Réessayer
          </button>
          {signOutButton}
        </AuthScreen>
      );
    case "ready":
      return <>{children}</>;
  }
}

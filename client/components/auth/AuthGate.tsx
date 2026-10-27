import { useEffect, useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { hideSplash } from "@/lib/splash";
import SignIn from "@/pages/SignIn";
import Welcome from "@/pages/Welcome";
import { AuthScreen, authButtonClass } from "./AuthScreen";
import { RequestResidence } from "./RequestResidence";

/**
 * Shows the app only to signed-in neighbors with a profile in a residence.
 * The opening screen stays up while the saved session is checked.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const { state, reload, signOut } = useAuth();
  const checking = state.status === "loading";
  const [asking, setAsking] = useState(false);

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
      if (asking) {
        return (
          <RequestResidence
            initialEmail={state.session.user.email}
            onBack={() => setAsking(false)}
          />
        );
      }
      return (
        <AuthScreen
          title="Aucune résidence"
          intro="Votre compte n’est rattaché à aucune résidence. Si votre résidence n’est pas encore sur Voisin, demandez-la ; sinon, réessayez un peu plus tard."
        >
          <button
            type="button"
            onClick={() => setAsking(true)}
            className={authButtonClass}
          >
            Demander Voisin pour ma résidence
          </button>
          <button
            type="button"
            onClick={reload}
            className="mt-3 h-11 w-full rounded-2xl text-sm font-bold text-primary"
          >
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

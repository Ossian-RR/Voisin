import { useEffect, useState, type FormEvent } from "react";
import { MailCheck } from "lucide-react";
import { linkErrorMessage, signInErrorMessage } from "@shared/auth";
import { isValidEmail } from "@shared/residence";
import {
  AuthScreen,
  authButtonClass,
  authFieldClass,
} from "@/components/auth/AuthScreen";
import { supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

/** Sign-in with a link sent by e-mail. Only invited neighbors can get one. */
export default function SignIn() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | undefined>(() =>
    linkErrorMessage(window.location.hash),
  );
  const [sending, setSending] = useState(false);
  const [sentTo, setSentTo] = useState<string>();

  // Once shown, drop the link error from the address so a reload doesn't repeat it.
  useEffect(() => {
    if (linkErrorMessage(window.location.hash)) {
      history.replaceState(
        null,
        "",
        window.location.pathname + window.location.search,
      );
    }
  }, []);

  const sendLink = async (address: string) => {
    setSending(true);
    setError(undefined);
    const { error: failure } = await supabase.auth.signInWithOtp({
      email: address,
      options: {
        // Voisin is invite only: never create an account here.
        shouldCreateUser: false,
        emailRedirectTo: window.location.origin + import.meta.env.BASE_URL,
      },
    });
    setSending(false);
    if (failure) {
      setError(signInErrorMessage(failure));
      return;
    }
    setSentTo(address);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const address = email.trim();
    if (!isValidEmail(address)) {
      setError("Indiquez une adresse e-mail valide.");
      return;
    }
    void sendLink(address);
  };

  if (sentTo) {
    return (
      <AuthScreen
        title="Vérifiez votre boîte mail"
        intro={
          <>
            Nous avons envoyé un lien de connexion à{" "}
            <span className="font-semibold text-foreground">{sentTo}</span>.
            Ouvrez-le sur ce téléphone pour entrer dans Voisin.
          </>
        }
      >
        <div className="flex items-start gap-3 rounded-2xl bg-secondary p-4 text-sm text-secondary-foreground">
          <MailCheck className="mt-0.5 size-5 shrink-0" aria-hidden />
          <p>
            Rien reçu après quelques minutes ? Regardez dans les courriers
            indésirables.
          </p>
        </div>
        {error && (
          <p
            role="alert"
            className="mt-4 text-sm font-semibold text-destructive"
          >
            {error}
          </p>
        )}
        <button
          type="button"
          disabled={sending}
          onClick={() => void sendLink(sentTo)}
          className={authButtonClass}
        >
          {sending ? "Envoi…" : "Renvoyer le lien"}
        </button>
        <button
          type="button"
          onClick={() => {
            setSentTo(undefined);
            setError(undefined);
          }}
          className="mt-3 h-11 w-full rounded-2xl text-sm font-bold text-primary"
        >
          Utiliser une autre adresse
        </button>
      </AuthScreen>
    );
  }

  return (
    <AuthScreen
      title="Connexion"
      intro="Voisin est réservé aux voisins invités. Indiquez votre adresse e-mail : vous recevrez un lien pour vous connecter, sans mot de passe."
    >
      <form onSubmit={handleSubmit} noValidate>
        <label htmlFor="sign-in-email" className="block text-sm font-bold">
          Adresse e-mail
        </label>
        <input
          id="sign-in-email"
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          value={email}
          onChange={(event) => {
            setEmail(event.target.value);
            setError(undefined);
          }}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? "sign-in-error" : undefined}
          className={cn(
            authFieldClass,
            error ? "border-destructive" : "border-border focus:border-primary",
          )}
        />
        {error && (
          <p
            id="sign-in-error"
            role="alert"
            className="mt-1.5 text-sm font-semibold text-destructive"
          >
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={sending || !email.trim()}
          className={authButtonClass}
        >
          {sending ? "Envoi…" : "Recevoir mon lien de connexion"}
        </button>
      </form>
    </AuthScreen>
  );
}

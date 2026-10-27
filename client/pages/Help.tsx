import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import {
  HELP_TOPICS,
  MIN_MESSAGE_LENGTH,
  isValidEmail,
  type HelpTopic,
} from "@shared/residence";
import { PageHeader } from "@/components/layout/PageHeader";
import { fieldClass } from "@/components/ProfileFields";
import { useMe } from "@/lib/auth";
import { useSendHelp } from "@/lib/data";
import { card, primaryButton } from "@/lib/styles";

/** Sends a message to the person who runs Voisin; they receive it by e-mail. */
export default function Help() {
  const me = useMe();
  const send = useSendHelp();
  const [topic, setTopic] = useState<HelpTopic>(HELP_TOPICS[0]);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(me.email ?? "");
  const length = message.trim().length;
  const canSend =
    length >= MIN_MESSAGE_LENGTH && isValidEmail(email) && !send.isPending;

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    send.mutate(
      { topic, message, replyEmail: email },
      {
        onSuccess: () => toast.success("Message envoyé"),
        onError: () =>
          toast.error("Le message n’a pas pu être envoyé", {
            description: "Vérifiez votre connexion internet, puis réessayez.",
          }),
      },
    );
  };

  if (!me.confirmed) {
    return (
      <div className="flex flex-col gap-4 px-5">
        <PageHeader title="Aide" className="px-0" />
        <p className={card}>
          Pour écrire à l’Aide, vérifiez d’abord vos informations dans votre
          profil puis appuyez sur « Enregistrer ».
        </p>
        <Link to="/profile" className={primaryButton}>
          Aller à mon profil
        </Link>
      </div>
    );
  }

  if (send.isSuccess) {
    return (
      <div className="flex flex-col gap-4 px-5">
        <PageHeader title="Aide" className="px-0" />
        <p className={card}>
          Merci, votre message est bien parti. La personne qui gère Voisin vous
          répondra à <strong>{email.trim()}</strong>.
        </p>
        <button
          type="button"
          onClick={() => {
            setMessage("");
            send.reset();
          }}
          className={primaryButton}
        >
          Écrire un autre message
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5">
      <PageHeader title="Aide" className="px-0" />
      <label className="block text-sm font-bold">
        Sujet
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value as HelpTopic)}
          className={`${fieldClass} border-border`}
        >
          {HELP_TOPICS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm font-bold">
        Message
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={2000}
          className={`${fieldClass} h-auto border-border py-2`}
        />
      </label>
      <label className="block text-sm font-bold">
        Votre adresse e-mail (pour la réponse)
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${fieldClass} border-border`}
        />
      </label>
      <button type="submit" disabled={!canSend} className={primaryButton}>
        {send.isPending ? "Envoi…" : "Envoyer"}
      </button>
      {length < MIN_MESSAGE_LENGTH && (
        <p className="text-center text-xs text-muted-foreground">
          {MIN_MESSAGE_LENGTH} caractères minimum · {length}/
          {MIN_MESSAGE_LENGTH}
        </p>
      )}
    </form>
  );
}

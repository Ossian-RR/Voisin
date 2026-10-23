import { useState, type FormEvent } from "react";
import { displayName } from "@shared/profile";
import {
  APP_MANAGER,
  HELP_TOPICS,
  MIN_MESSAGE_LENGTH,
  helpMailto,
  isValidEmail,
  type HelpTopic,
} from "@shared/residence";
import { PageHeader } from "@/components/layout/PageHeader";
import { fieldClass } from "@/components/ProfileFields";
import { useMe } from "@/lib/auth";
import { primaryButton } from "@/lib/styles";

/** Opens the e-mail app with a message to the person who runs Voisin. */
export default function Help() {
  const me = useMe();
  const [topic, setTopic] = useState<HelpTopic>(HELP_TOPICS[0]);
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState(me.email ?? "");
  const length = message.trim().length;
  const canSend = length >= MIN_MESSAGE_LENGTH && isValidEmail(email);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (!canSend) return;
    window.location.href = helpMailto(
      APP_MANAGER.email,
      topic,
      message,
      { name: displayName(me.profile), location: me.profile.location, email },
      me.residence,
    );
  };

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
          className={`${fieldClass} h-auto border-border py-2`}
        />
      </label>
      <label className="block text-sm font-bold">
        Votre adresse e-mail
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={`${fieldClass} border-border`}
        />
      </label>
      <button type="submit" disabled={!canSend} className={primaryButton}>
        Envoyer
      </button>
      <p className="text-center text-xs text-muted-foreground">
        {length < MIN_MESSAGE_LENGTH
          ? `${MIN_MESSAGE_LENGTH} caractères minimum · ${length}/${MIN_MESSAGE_LENGTH}`
          : "Votre application e-mail s’ouvre avec le message prêt."}
      </p>
    </form>
  );
}

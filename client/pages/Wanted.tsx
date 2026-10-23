import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { displayName } from "@shared/profile";
import {
  DEFAULT_HOUR,
  DEFAULT_MINUTE,
  HOURS,
  minutesFor,
  todayIso,
} from "@shared/wanted";
import { PageHeader } from "@/components/layout/PageHeader";
import { fieldClass } from "@/components/ProfileFields";
import { useMe } from "@/lib/auth";
import { usePublishWanted } from "@/lib/data";
import { primaryButton } from "@/lib/styles";

export default function Wanted() {
  const { profile } = useMe();
  const publish = usePublishWanted();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [wantedOn, setWantedOn] = useState("");
  const [hour, setHour] = useState(DEFAULT_HOUR);
  const [minute, setMinute] = useState(DEFAULT_MINUTE);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    publish.mutate(
      { text, wantedOn, wantedAt: hour && minute ? `${hour}:${minute}` : "" },
      {
        onSuccess: () => {
          toast.success("Recherche publiée", {
            description: "Vos voisins la voient sur l’accueil.",
          });
          navigate("/");
        },
        onError: () => toast.error("La recherche n’a pas pu être publiée"),
      },
    );
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 px-5">
      <PageHeader title="Je cherche" className="px-0" />
      <label className="block text-sm font-bold">
        {displayName(profile)} recherche
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          maxLength={500}
          spellCheck={false}
          className={`${fieldClass} h-auto border-border py-2`}
        />
      </label>
      <label className="block text-sm font-bold">
        pour la date du
        <input
          type="date"
          value={wantedOn}
          min={todayIso(new Date())}
          onChange={(e) => setWantedOn(e.target.value)}
          className={`${fieldClass} border-border`}
        />
      </label>
      <fieldset>
        <legend className="text-sm font-bold">à l’heure suivante :</legend>
        <div className="flex gap-2">
          <select
            aria-label="Heure"
            value={hour}
            onChange={(e) => {
              setHour(e.target.value);
              if (!minutesFor(e.target.value).includes(minute)) setMinute("00");
            }}
            className={`${fieldClass} border-border`}
          >
            <option value="">Heure</option>
            {HOURS.map((h) => (
              <option key={h} value={h}>
                {h}h
              </option>
            ))}
          </select>
          <select
            aria-label="Minutes"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            className={`${fieldClass} border-border`}
          >
            {minutesFor(hour).map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </fieldset>
      <button
        type="submit"
        disabled={!text.trim() || publish.isPending}
        className={primaryButton}
      >
        Publier ma recherche
      </button>
    </form>
  );
}

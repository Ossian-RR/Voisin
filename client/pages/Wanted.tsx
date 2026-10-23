import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { displayName } from "@shared/profile";
import { DateTimeFields, useDateTime } from "@/components/DateTimeFields";
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
  const when = useDateTime();

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    publish.mutate(
      { text, ...when.value },
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
      <DateTimeFields state={when} />
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

import { useState } from "react";
import {
  DEFAULT_HOUR,
  DEFAULT_MINUTE,
  HOURS,
  minutesFor,
  todayIso,
} from "@shared/wanted";
import { fieldClass } from "@/components/ProfileFields";

/** Day and time picked in the forms; the time defaults to 12:00. */
export function useDateTime() {
  const [wantedOn, setWantedOn] = useState("");
  const [hour, setHour] = useState<string>(DEFAULT_HOUR);
  const [minute, setMinute] = useState<string>(DEFAULT_MINUTE);
  return {
    wantedOn,
    hour,
    minute,
    setWantedOn,
    setHour: (h: string) => {
      setHour(h);
      if (!minutesFor(h).includes(minute)) setMinute("00");
    },
    setMinute,
    /** What to save: { wantedOn, wantedAt }. */
    value: { wantedOn, wantedAt: hour && minute ? `${hour}:${minute}` : "" },
  };
}

/** "pour la date du" and "à l'heure suivante :", as in Je cherche. */
export function DateTimeFields({
  state,
}: {
  state: ReturnType<typeof useDateTime>;
}) {
  const field = `${fieldClass} border-border`;
  return (
    <>
      <label className="block text-sm font-bold">
        pour la date du
        <input
          type="date"
          value={state.wantedOn}
          min={todayIso(new Date())}
          onChange={(e) => state.setWantedOn(e.target.value)}
          className={field}
        />
      </label>
      <fieldset>
        <legend className="text-sm font-bold">à l’heure suivante :</legend>
        <div className="flex gap-2">
          <select
            aria-label="Heure"
            value={state.hour}
            onChange={(e) => state.setHour(e.target.value)}
            className={field}
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
            value={state.minute}
            onChange={(e) => state.setMinute(e.target.value)}
            className={field}
          >
            {minutesFor(state.hour).map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>
        </div>
      </fieldset>
    </>
  );
}

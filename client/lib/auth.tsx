import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { NeighborProfile, Residence } from "@shared/api";
import {
  ME_SELECT,
  profileFromRow,
  residenceFromRow,
  type MeRow,
} from "@shared/db";
import { supabase } from "./supabase";

/** The signed-in person. A new user has no profile and no residence yet. */
export interface Me {
  userId: string;
  email?: string;
  /** Missing until the profile is saved for the first time (Profil page). */
  profileId?: string;
  profile?: NeighborProfile;
  photoPath?: string;
  admittedOn?: string;
  /** Set once the neighbor pressed « Enregistrer » on the Profil page. */
  confirmed: boolean;
  /** Missing until the admin attaches them to a residence. */
  residence?: Residence;
}

/** A neighbor with a profile in a residence: everything in the app works. */
export type Member = Me & {
  profileId: string;
  profile: NeighborProfile;
  admittedOn: string;
  residence: Residence;
};

export function isMember(me: Me): me is Member {
  return Boolean(me.profileId && me.profile && me.residence);
}

export type AuthState =
  | { status: "loading" | "signed-out" }
  | { status: "error"; session: Session }
  | { status: "ready"; session: Session; me: Me };

interface AuthContextValue {
  state: AuthState;
  /** Reads the profile again (after an edit). */
  reload: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

async function readMe(session: Session): Promise<AuthState> {
  const { data, error } = await supabase
    .from("profiles")
    .select(ME_SELECT)
    .eq("user_id", session.user.id)
    .returns<MeRow[]>()
    .maybeSingle();
  if (error) return { status: "error", session };
  const me: Me = {
    userId: session.user.id,
    email: session.user.email,
    confirmed: false,
  };
  if (data) {
    const profile = profileFromRow(data);
    if (!profile) return { status: "error", session };
    Object.assign(me, {
      profileId: data.id,
      profile,
      photoPath: data.photo_path ?? undefined,
      admittedOn: data.admitted_on,
      confirmed: Boolean(data.confirmed_at),
      residence: residenceFromRow(data.residence),
    });
  }
  return { status: "ready", session, me };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>();
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, next) =>
      setSession(next),
    );
    return () => data.subscription.unsubscribe();
  }, []);

  // Changes only when the signed-in person changes, not on token refresh.
  const sessionKey =
    session === undefined ? "checking" : (session?.user.id ?? "signed-out");

  useEffect(() => {
    if (session === undefined) return;
    if (!session) return setState({ status: "signed-out" });
    let cancelled = false;
    readMe(session).then((next) => !cancelled && setState(next));
    return () => {
      cancelled = true;
    };
  }, [sessionKey, attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ state, reload, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

/** The signed-in person. Only use it inside the app (after AuthGate). */
export function useMe(): Me {
  const { state } = useAuth();
  if (state.status !== "ready") {
    throw new Error("useMe must be used once signed in");
  }
  return state.me;
}

/** For pages that need a residence; AppLayout only shows them to members. */
export function useMember(): Member {
  const me = useMe();
  if (!isMember(me))
    throw new Error("useMember needs a profile and a residence");
  return me;
}

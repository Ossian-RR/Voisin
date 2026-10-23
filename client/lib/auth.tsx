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
  newProfileRow,
  profileFromRow,
  residenceFromRow,
  type MeRow,
} from "@shared/db";
import { supabase } from "./supabase";

/** The signed-in neighbor. */
export interface Me {
  userId: string;
  email?: string;
  profileId: string;
  profile: NeighborProfile;
  photoPath?: string;
  admittedOn: string;
  residence: Residence;
}

/**
 * loading: checking the session or reading the profile · signed-out ·
 * needs-profile: first sign-in · no-residence: the admin hasn't set one ·
 * error: the profile couldn't be read · ready.
 */
export type AuthState =
  | { status: "loading" | "signed-out" }
  | { status: "needs-profile" | "no-residence" | "error"; session: Session }
  | { status: "ready"; session: Session; me: Me };

interface AuthContextValue {
  state: AuthState;
  /** Creates the profile on first sign-in. Returns false on failure. */
  createProfile: (profile: NeighborProfile) => Promise<boolean>;
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
  if (!data) {
    // No profile yet: the residence set by the admin must exist first.
    const { data: residence } = await supabase
      .from("residences")
      .select("id")
      .maybeSingle();
    return { status: residence ? "needs-profile" : "no-residence", session };
  }
  const profile = profileFromRow(data);
  const residence = residenceFromRow(data.residence);
  if (!profile || !residence) return { status: "error", session };
  return {
    status: "ready",
    session,
    me: {
      userId: session.user.id,
      email: session.user.email,
      profileId: data.id,
      profile,
      photoPath: data.photo_path ?? undefined,
      admittedOn: data.admitted_on,
      residence,
    },
  };
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

  const createProfile = useCallback(
    async (profile: NeighborProfile) => {
      if (state.status !== "needs-profile") return false;
      const { error } = await supabase
        .from("profiles")
        .insert(newProfileRow(state.session.user.id, profile));
      if (error) return false;
      reload();
      return true;
    },
    [state, reload],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  return (
    <AuthContext.Provider value={{ state, createProfile, reload, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

/** The signed-in neighbor. Only use it inside the app (after AuthGate). */
export function useMe(): Me {
  const { state } = useAuth();
  if (state.status !== "ready") {
    throw new Error("useMe must be used once the neighbor is signed in");
  }
  return state.me;
}

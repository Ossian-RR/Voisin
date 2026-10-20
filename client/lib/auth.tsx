import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import type { NeighborProfile } from "@shared/api";
import { newProfileRow, profileFromRow } from "@shared/auth";
import { saveProfile } from "./profile";
import { supabase } from "./supabase";

/**
 * - loading: checking the saved session, or reading the profile.
 * - signed-out: show the sign-in screen.
 * - needs-profile: signed in for the first time, the profile is missing.
 * - ready: signed in with a profile.
 * - error: the profile could not be read (network, database).
 */
export type AuthState =
  | { status: "loading" }
  | { status: "signed-out" }
  | { status: "needs-profile"; session: Session }
  | { status: "ready"; session: Session; profileId: string }
  | { status: "error"; session: Session };

interface AuthContextValue {
  state: AuthState;
  /** Creates the neighbor's profile on first sign-in. Returns false on failure. */
  createProfile: (profile: NeighborProfile) => Promise<boolean>;
  retry: () => void;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

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
    if (!session) {
      setState({ status: "signed-out" });
      return;
    }
    let cancelled = false;
    setState({ status: "loading" });
    supabase
      .from("profiles")
      .select("id, civility, last_name, location")
      .eq("user_id", session.user.id)
      .maybeSingle()
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setState({ status: "error", session });
        } else if (!data) {
          setState({ status: "needs-profile", session });
        } else {
          // The other screens still read the profile from the browser (until
          // they move to Supabase), so keep that copy in step.
          const profile = profileFromRow(data);
          if (profile) saveProfile(profile);
          setState({ status: "ready", session, profileId: data.id });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [sessionKey, attempt]);

  const createProfile = useCallback(
    async (profile: NeighborProfile) => {
      if (state.status !== "needs-profile") return false;
      const { data, error } = await supabase
        .from("profiles")
        .insert(newProfileRow(state.session.user.id, profile))
        .select("id")
        .single();
      if (error || !data) return false;
      saveProfile(profile);
      setState({ status: "ready", session: state.session, profileId: data.id });
      return true;
    },
    [state],
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return (
    <AuthContext.Provider value={{ state, createProfile, retry, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
}

/** The signed-in neighbor's login id and profile id. The app only renders once both exist. */
export function useMe(): { userId: string; profileId: string } {
  const { state } = useAuth();
  if (state.status !== "ready") {
    throw new Error("useMe must be used once the neighbor is signed in");
  }
  return { userId: state.session.user.id, profileId: state.profileId };
}

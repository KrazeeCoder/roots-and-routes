import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../../utils/supabase";
import { getProfile } from "../data/portalApi";
import type { ContributorProfile, ContributorRole } from "../types/portal";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: ContributorProfile | null;
  role: ContributorRole | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<ContributorProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (nextSession: Session | null) => {
    if (!nextSession?.user) {
      setProfile(null);
      return;
    }

    try {
      const nextProfile = await getProfile(nextSession.user.id);
      setProfile(nextProfile);
    } catch (error) {
      console.error("Failed to load profile", error);
      setProfile(null);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    void supabase.auth
      .getSession()
      .then(async ({ data, error }) => {
        if (error) throw error;
        if (!isMounted) return;

        setSession(data.session);
        await loadProfile(data.session);
      })
      .catch((error) => {
        console.error("Failed to initialize auth session", error);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void loadProfile(nextSession);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) {
      setProfile(null);
      return;
    }

    const latest = await getProfile(session.user.id);
    setProfile(latest);
  }, [session]);

  const value = useMemo<AuthContextValue>(() => {
    const role = profile?.role ?? null;
    return {
      session,
      user: session?.user ?? null,
      profile,
      role,
      loading,
      refreshProfile,
    };
  }, [session, profile, loading, refreshProfile]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}

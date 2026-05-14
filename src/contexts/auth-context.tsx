import type { Session } from "@supabase/supabase-js";
import { type Href, useRouter, useSegments } from "expo-router";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Profile } from "@/lib/types";

interface AuthContextValue {
  session: Session | null;
  user: Session["user"] | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  const fetchProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Failed to fetch profile", error.message);
      return null;
    }
    return data as Profile;
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    const p = await fetchProfile(session.user.id);
    setProfile(p);
  }, [session, fetchProfile]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id).then(setProfile);
      }
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, sess) => {
      setSession(sess);
      if (sess?.user) {
        const p = await fetchProfile(sess.user.id);
        setProfile(p);
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchProfile]);

  // Auth gate
  useEffect(() => {
    if (loading) return;

    const segs = segments as string[];
    const inAuthGroup = segs[0] === "(auth)";
    const inAgeVerify = segs[1] === "age-verify";

    if (!session) {
      if (!inAuthGroup) {
        router.replace("/(auth)/sign-in" as Href);
      }
      return;
    }

    const needsAge = !profile?.dateOfBirth;
    if (needsAge && !inAgeVerify) {
      router.replace("/(auth)/age-verify");
      return;
    }

    if (!needsAge && inAuthGroup) {
      router.replace("/(tabs)");
    }
  }, [session, profile, loading, segments, router]);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!session?.user) throw new Error("Not signed in");

      // Map camelCase to snake_case for Supabase
      const supabasePatch: Record<string, unknown> = { ...patch };
      if ("dateOfBirth" in patch) {
        supabasePatch.date_of_birth = patch.dateOfBirth;
        delete supabasePatch.dateOfBirth;
      }
      if ("avatarUrl" in patch) {
        supabasePatch.avatar_url = patch.avatarUrl;
        delete supabasePatch.avatarUrl;
      }
      if ("displayName" in patch) {
        supabasePatch.display_name = patch.displayName;
        delete supabasePatch.displayName;
      }
      if ("isPremium" in patch) {
        supabasePatch.is_premium = patch.isPremium;
        delete supabasePatch.isPremium;
      }

      const { error } = await supabase
        .from("profiles")
        .update({ ...supabasePatch, updated_at: new Date().toISOString() })
        .eq("id", session.user.id);
      if (error) throw error;
      await refreshProfile();
    },
    [session, refreshProfile]
  );

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile,
      signIn: async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      },
      signUp: async (email: string, password: string, username: string) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username } },
        });
        if (error) throw error;
      },
      signOut: async () => {
        await supabase.auth.signOut();
      },
      updateProfile,
    }),
    [session, profile, loading, refreshProfile, updateProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

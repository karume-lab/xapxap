import type { Session } from "@supabase/supabase-js";
import { useRouter, useSegments } from "expo-router";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
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

import { mockProfile, updateMockProfile } from "@/features/auth/mock-data/auth";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Initialize
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Auth gate
  useEffect(() => {
    if (loading) return;

    const segs = segments as string[];
    const inAuthGroup = segs[0] === "(auth)";
    const inAgeVerify = segs[1] === "age-verify";

    if (!session) {
      if (!inAuthGroup) {
        router.replace("/(auth)/sign-in");
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

  const refreshProfile = useCallback(async () => {
    // No-op in mock
  }, []);

  const updateProfile = useCallback(async (patch: Partial<Profile>) => {
    await new Promise((resolve) => setTimeout(resolve, 800));
    const updated = updateMockProfile(patch);
    setProfile(updated);
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile,
      signIn: async (email: string, _password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        setSession({
          user: { id: mockProfile.id, email },
          access_token: "mock",
          refresh_token: "mock",
        } as Session);
        setProfile({ ...mockProfile });
      },
      signUp: async (email: string, _password: string, username: string) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const updated = updateMockProfile({ username });
        setSession({
          user: { id: mockProfile.id, email },
          access_token: "mock",
          refresh_token: "mock",
        } as Session);
        setProfile(updated);
      },
      signOut: async () => {
        setSession(null);
        setProfile(null);
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

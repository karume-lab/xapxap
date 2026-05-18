import type { Session } from "@supabase/supabase-js";
import * as SecureStore from "expo-secure-store";
import type React from "react";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { AUTH_SESSION_KEY } from "@/features/auth/constants";
import { mockProfile, updateMockProfile } from "@/features/auth/mock-data/auth";
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

  // Initialize and load session from Secure Store
  useEffect(() => {
    async function loadStoredSession() {
      try {
        const stored = await SecureStore.getItemAsync(AUTH_SESSION_KEY);
        if (stored) {
          const parsed = JSON.parse(stored) as Session;
          setSession(parsed);

          // Hydrate profile metadata from the saved session user_metadata
          const username = parsed.user?.user_metadata?.username || mockProfile.username;
          setProfile({
            ...mockProfile,
            username,
          });
        }
      } catch (err) {
        console.warn("SecureStore failed to load auth session:", err);
      } finally {
        setLoading(false);
      }
    }
    loadStoredSession();
  }, []);

  const refreshProfile = useCallback(async () => {
    // No-op in mock
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      await new Promise((resolve) => setTimeout(resolve, 800));
      const updated = updateMockProfile(patch);
      setProfile(updated);

      // If username changes, also update the session inside SecureStore to stay in sync!
      if (patch.username && session) {
        const updatedSession = {
          ...session,
          user: {
            ...session.user,
            user_metadata: {
              ...session.user?.user_metadata,
              username: patch.username,
            },
          },
        } as unknown as Session;

        try {
          await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(updatedSession));
          setSession(updatedSession);
        } catch (err) {
          console.warn("SecureStore failed to sync username change:", err);
        }
      }
    },
    [session]
  );

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      refreshProfile,
      signIn: async (email: string, _password: string) => {
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const newSession = {
          user: {
            id: mockProfile.id,
            email,
            user_metadata: { username: mockProfile.username },
          },
          access_token: "mock",
          refresh_token: "mock",
        } as unknown as Session;

        await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(newSession));
        setSession(newSession);
        setProfile({ ...mockProfile });
      },
      signUp: async (email: string, _password: string, username: string) => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const updated = updateMockProfile({ username });
        const newSession = {
          user: {
            id: mockProfile.id,
            email,
            user_metadata: { username },
          },
          access_token: "mock",
          refresh_token: "mock",
        } as unknown as Session;

        await SecureStore.setItemAsync(AUTH_SESSION_KEY, JSON.stringify(newSession));
        setSession(newSession);
        setProfile(updated);
      },
      signOut: async () => {
        try {
          await SecureStore.deleteItemAsync(AUTH_SESSION_KEY);
        } catch (err) {
          console.warn("SecureStore failed to clear session:", err);
        }
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

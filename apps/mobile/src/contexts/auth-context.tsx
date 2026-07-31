import AsyncStorage from "@react-native-async-storage/async-storage";
import type { Session } from "@supabase/supabase-js";
import type { Profile } from "@xapxap/types";
import type React from "react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { HAS_SEEN_ONBOARDING_KEY } from "@/features/auth/constants";
import { supabase } from "@/lib/supabase";

interface AuthContextValue {
  session: Session | null;
  user: Session["user"] | null;
  profile: Profile | null;
  loading: boolean;
  refreshProfile: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signInWithPhone: (phone: string) => Promise<void>;
  verifyOtp: (phone: string, token: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (patch: Partial<Profile>) => Promise<void>;
  isAuthModalVisible: boolean;
  showAuthModal: () => void;
  hideAuthModal: () => void;
  hasSeenOnboarding: boolean;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalVisible, setIsAuthModalVisible] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const profileCacheRef = useRef<string | null>(null);

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.warn("Failed to fetch profile:", error.message);
      return null;
    }
    return data as Profile;
  }, []);

  const ensureProfile = useCallback(
    async (userId: string, username?: string): Promise<Profile | null> => {
      const existing = await fetchProfile(userId);
      if (existing) return existing;

      const { error } = await supabase.from("profiles").insert({
        id: userId,
        username: username || `user_${userId.slice(0, 8)}`,
      });

      if (error) {
        return fetchProfile(userId);
      }

      return fetchProfile(userId);
    },
    [fetchProfile]
  );

  useEffect(() => {
    let mounted = true;

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!mounted) return;

      setSession(newSession);

      if (newSession?.user?.id) {
        if (newSession.user.id === profileCacheRef.current) return;

        const p = await ensureProfile(
          newSession.user.id,
          newSession.user.user_metadata?.username as string | undefined
        );
        if (!mounted) return;
        setProfile(p);
        profileCacheRef.current = newSession.user.id;
      } else {
        setProfile(null);
        profileCacheRef.current = null;
      }
    });

    supabase.auth.getSession().then(async ({ data: { session: initial } }) => {
      if (!mounted) return;
      setSession(initial);

      if (initial?.user?.id && initial.user.id !== profileCacheRef.current) {
        const p = await ensureProfile(
          initial.user.id,
          initial.user.user_metadata?.username as string | undefined
        );
        if (!mounted) return;
        setProfile(p);
        profileCacheRef.current = initial.user.id;
      }

      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [ensureProfile]);

  useEffect(() => {
    AsyncStorage.getItem(HAS_SEEN_ONBOARDING_KEY)
      .then((v) => setHasSeenOnboarding(v === "true"))
      .catch(() => {});
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user?.id) {
      const p = await fetchProfile(session.user.id);
      setProfile(p);
    }
  }, [session, fetchProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signUp = useCallback(async (email: string, password: string, username: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    });
    if (error) throw error;
  }, []);

  const signInWithPhone = useCallback(async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) throw error;
  }, []);

  const verifyOtp = useCallback(
    async (phone: string, token: string) => {
      const { data, error } = await supabase.auth.verifyOtp({
        phone,
        token,
        type: "sms",
      });
      if (error) throw error;
      if (data.session) {
        setSession(data.session);
        if (data.session.user?.id) {
          const p = await ensureProfile(
            data.session.user.id,
            data.session.user.user_metadata?.username as string | undefined
          );
          setProfile(p);
          profileCacheRef.current = data.session.user.id;
        }
      }
    },
    [ensureProfile]
  );

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setProfile(null);
  }, []);

  const updateProfile = useCallback(
    async (patch: Partial<Profile>) => {
      if (!session?.user?.id) return;

      const { error } = await supabase.from("profiles").update(patch).eq("id", session.user.id);

      if (error) throw error;

      setProfile((prev: Profile | null) => (prev ? { ...prev, ...patch } : prev));
    },
    [session]
  );

  const completeOnboarding = useCallback(() => {
    setHasSeenOnboarding(true);
    AsyncStorage.setItem(HAS_SEEN_ONBOARDING_KEY, "true").catch(() => {});
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      profile,
      loading,
      isAuthModalVisible,
      showAuthModal: () => setIsAuthModalVisible(true),
      hideAuthModal: () => setIsAuthModalVisible(false),
      hasSeenOnboarding,
      completeOnboarding,
      refreshProfile,
      signIn,
      signUp,
      signInWithPhone,
      verifyOtp,
      signOut,
      updateProfile,
    }),
    [
      session,
      profile,
      loading,
      refreshProfile,
      updateProfile,
      isAuthModalVisible,
      hasSeenOnboarding,
      completeOnboarding,
      signIn,
      signUp,
      signInWithPhone,
      verifyOtp,
      signOut,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

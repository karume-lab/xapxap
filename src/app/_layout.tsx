import "@/global.css";

import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";

import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useUniwind } from "uniwind";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { DataSaverProvider } from "@/contexts/data-saver-context";
import { AuthModal } from "@/features/auth/components/AuthModal";
import { NAV_THEME } from "@/lib/theme";

const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AppLayout({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { session, loading, profile, hasSeenOnboarding } = useAuth();
  const { theme } = useUniwind();
  const router = useRouter();
  const segments = useSegments();

  // We no longer need local onboarding state since we read it from AuthContext.
  // Wait until both fonts are loaded and the AuthContext has initialized.

  useEffect(() => {
    // Only hide the splash screen when fonts are loaded and auth check is done
    if (fontsLoaded && !loading) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading]);

  useEffect(() => {
    if (loading || !fontsLoaded) return;

    const segs = segments as string[];
    const inAuthGroup = segs[0] === "(auth)";
    const inAgeVerify = segs[1] === "age-verify";
    const inOnboarding = segs[1] === "onboarding";

    if (!session) {
      if (!hasSeenOnboarding && !inOnboarding) {
        router.replace("/(auth)/onboarding");
      }
      return;
    }

    const needsAge = !profile?.dateOfBirth;
    if (needsAge && !inAgeVerify) {
      router.replace("/(auth)/age-verify");
      return;
    }

    if (!needsAge && inAuthGroup && !inOnboarding) {
      router.replace("/(tabs)");
    }
  }, [session, profile, loading, fontsLoaded, hasSeenOnboarding, segments, router]);

  // Keep the native splash screen showing until fonts are loaded and auth check completes
  if (!fontsLoaded || loading) {
    return null;
  }

  return (
    <ThemeProvider value={NAV_THEME[theme ?? "light"]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
      </Stack>
      <AuthModal />
      <PortalHost />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  const [loaded, error] = useFonts({
    Inter_400Regular,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  const fontsLoaded = loaded || !!error;

  return (
    <AuthProvider>
      <DataSaverProvider>
        <KeyboardProvider>
          <QueryClientProvider client={queryClient}>
            <AppLayout fontsLoaded={fontsLoaded} />
          </QueryClientProvider>
        </KeyboardProvider>
      </DataSaverProvider>
    </AuthProvider>
  );
}

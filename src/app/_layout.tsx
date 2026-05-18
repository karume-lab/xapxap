import "@/global.css";

import {
  Inter_400Regular,
  Inter_600SemiBold,
  Inter_700Bold,
  useFonts,
} from "@expo-google-fonts/inter";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ThemeProvider } from "@react-navigation/native";
import { PortalHost } from "@rn-primitives/portal";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { useUniwind } from "uniwind";
import { AuthProvider, useAuth } from "@/contexts/auth-context";
import { DataSaverProvider } from "@/contexts/data-saver-context";
import { NAV_THEME } from "@/lib/theme";

const queryClient = new QueryClient();

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from "expo-router";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

function AppLayout({ fontsLoaded }: { fontsLoaded: boolean }) {
  const { session, loading, profile } = useAuth();
  const { theme } = useUniwind();
  const router = useRouter();
  const segments = useSegments();

  const [onboardingLoaded, setOnboardingLoaded] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem("has_seen_onboarding").then((val) => {
      setHasSeenOnboarding(val === "true");
      setOnboardingLoaded(true);
    });
  }, []);

  useEffect(() => {
    // Only hide the splash screen when fonts are loaded and the initial auth check has finished
    if (fontsLoaded && !loading && onboardingLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, loading, onboardingLoaded]);

  useEffect(() => {
    if (loading || !fontsLoaded || !onboardingLoaded) return;

    const segs = segments as string[];
    const inAuthGroup = segs[0] === "(auth)";
    const inAgeVerify = segs[1] === "age-verify";
    const inOnboarding = segs[1] === "onboarding";

    if (!session) {
      if (!inAuthGroup && segs[0] !== "(tabs)") {
        if (!hasSeenOnboarding) {
          router.replace("/(auth)/onboarding");
        } else {
          router.replace("/(tabs)");
        }
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
  }, [
    session,
    profile,
    loading,
    fontsLoaded,
    onboardingLoaded,
    hasSeenOnboarding,
    segments,
    router,
  ]);

  // Keep the native splash screen showing until fonts are loaded and auth check completes
  if (!fontsLoaded || loading || !onboardingLoaded) {
    return null;
  }

  const isAuthenticated = !!session;
  const needsAge = isAuthenticated && !profile?.dateOfBirth;

  return (
    <ThemeProvider value={NAV_THEME[theme ?? "light"]}>
      <StatusBar style={theme === "dark" ? "light" : "dark"} />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Protected guard={!isAuthenticated || needsAge}>
          <Stack.Screen name="(auth)" />
        </Stack.Protected>
        <Stack.Protected guard={isAuthenticated && !needsAge}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="profile" />
        </Stack.Protected>
      </Stack>
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

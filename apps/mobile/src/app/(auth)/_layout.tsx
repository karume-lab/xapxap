import { Stack } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { useColors } from "@/hooks/use-colors";

export default function AuthLayout() {
  const colors = useColors();
  const { hasSeenOnboarding } = useAuth();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
      }}>
      {/* Onboarding: only visible before the user completes it */}
      <Stack.Protected guard={!hasSeenOnboarding}>
        <Stack.Screen name="onboarding" />
      </Stack.Protected>
    </Stack>
  );
}

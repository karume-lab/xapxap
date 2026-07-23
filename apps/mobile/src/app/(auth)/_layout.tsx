import { Stack } from "expo-router";
import { useAuth } from "@/contexts/auth-context";
import { useColors } from "@/hooks/use-colors";

export default function AuthLayout() {
  const colors = useColors();
  const { profile, hasSeenOnboarding } = useAuth();

  const hasVerifiedAge = !!profile?.dateOfBirth;

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

      {/* Age verify: only visible when the user hasn't set a DOB yet */}
      <Stack.Protected guard={!hasVerifiedAge}>
        <Stack.Screen name="age-verify" />
      </Stack.Protected>
    </Stack>
  );
}

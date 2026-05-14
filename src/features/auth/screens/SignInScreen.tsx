import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { Link } from "expo-router";
import { LockIcon, MailIcon } from "lucide-react-native";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import type { TextInput } from "react-native";
import { Alert, Text, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useColors } from "@/hooks/use-colors";

const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type SignInValues = z.infer<typeof signInSchema>;

export function SignInScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { height } = useWindowDimensions();
  const { signIn } = useAuth();
  const [busy, setBusy] = useState(false);

  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignInValues) => {
    setBusy(true);
    try {
      await signIn(values.email.trim(), values.password);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not sign in";
      Alert.alert("Sign in", msg);
    } finally {
      setBusy(false);
    }
  };

  const compact = height < 700;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#1A0A2E", "transparent"]}
        className="absolute top-0 left-0 right-0 h-[360px] opacity-70"
      />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: height * 0.22 + insets.top,
          paddingBottom: insets.bottom + (compact ? 40 : 60),
        }}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <View className="w-full max-w-[420px] self-center gap-6">
          <View>
            <Text className="text-foreground font-bold text-4xl tracking-tighter font-[Inter_700Bold]">
              Xap<Text className="text-primary">Xap</Text>
            </Text>
            <Text className="text-muted-foreground mt-2 text-base font-[Inter_400Regular]">
              A social space for your loudest, quietest waves.
            </Text>
          </View>

          <View className="gap-3">
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View className="gap-1">
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    autoComplete="email"
                    returnKeyType="next"
                    onSubmitEditing={() => passwordRef.current?.focus()}
                    blurOnSubmit={false}
                    icon={<MailIcon size={18} color={colors.mutedForeground} />}
                  />
                  {errors.email && (
                    <Text className="text-destructive text-xs ml-4">{errors.email.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <View className="gap-1">
                  <Input
                    ref={passwordRef}
                    value={value}
                    onChangeText={onChange}
                    placeholder="Password"
                    secureTextEntry
                    autoComplete="password"
                    returnKeyType="done"
                    onSubmitEditing={handleSubmit(onSubmit)}
                    icon={<LockIcon size={18} color={colors.mutedForeground} />}
                  />
                  {errors.password && (
                    <Text className="text-destructive text-xs ml-4">{errors.password.message}</Text>
                  )}
                </View>
              )}
            />

            <Button
              onPress={handleSubmit(onSubmit)}
              size="lg"
              className="mt-2 h-14 rounded-[26px]"
              isLoading={busy}>
              <Text
                className="font-bold text-lg text-primary-foreground"
                numberOfLines={1}
                adjustsFontSizeToFit>
                Enter the wave
              </Text>
            </Button>
          </View>

          <View className="flex-row justify-center gap-1 mt-1">
            <Text className="text-muted-foreground text-sm">New here?</Text>
            <Link href="/(auth)/sign-up" asChild>
              <Text className="text-primary font-semibold text-sm">Create an account</Text>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

import { zodResolver } from "@hookform/resolvers/zod";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { AtSignIcon, LockIcon, MailIcon } from "lucide-react-native";
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

const signUpSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, and underscores allowed"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignUpValues = z.infer<typeof signUpSchema>;

export function SignUpScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { signUp } = useAuth();
  const [busy, setBusy] = useState(false);

  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: SignUpValues) => {
    setBusy(true);
    try {
      await signUp(values.email.trim(), values.password, values.username.trim().toLowerCase());
      Alert.alert(
        "Check your email",
        `We sent a confirmation link to ${values.email.trim()}. Tap it, then come back and sign in.`,
        [
          {
            text: "Go to sign in",
            onPress: () => router.replace("/(auth)/sign-in"),
          },
        ]
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not sign up";
      Alert.alert("Sign up", msg);
    } finally {
      setBusy(false);
    }
  };

  const compact = height < 720;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <LinearGradient
        colors={[colors.muted, "transparent"]}
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
              Make your <Text className="text-primary">wave</Text>
            </Text>
            <Text className="text-muted-foreground mt-2 text-base font-[Inter_400Regular]">
              Pick a handle, drop a thought. Your space, your signal.
            </Text>
          </View>

          <View className="gap-3">
            <Controller
              control={control}
              name="username"
              render={({ field: { onChange, value } }) => (
                <View className="gap-1">
                  <Input
                    value={value}
                    onChangeText={onChange}
                    placeholder="username"
                    autoCapitalize="none"
                    returnKeyType="next"
                    onSubmitEditing={() => emailRef.current?.focus()}
                    blurOnSubmit={false}
                    icon={<AtSignIcon size={18} color={colors.mutedForeground} />}
                  />
                  {errors.username && (
                    <Text className="text-destructive text-xs ml-4">{errors.username.message}</Text>
                  )}
                </View>
              )}
            />

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, value } }) => (
                <View className="gap-1">
                  <Input
                    ref={emailRef}
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
                    placeholder="Password (6+ chars)"
                    secureTextEntry
                    autoComplete="new-password"
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
              isLoading={busy}
              className="mt-2 h-14 rounded-[26px]">
              <Text
                className="font-bold text-lg text-primary-foreground"
                numberOfLines={1}
                adjustsFontSizeToFit>
                Create my space
              </Text>
            </Button>
          </View>

          <View className="flex-row justify-center gap-1 mt-1">
            <Text className="text-muted-foreground text-sm">Already on XapXap?</Text>
            <Link href="/(auth)/sign-in" asChild>
              <Text className="text-primary font-semibold text-sm">Sign in</Text>
            </Link>
          </View>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

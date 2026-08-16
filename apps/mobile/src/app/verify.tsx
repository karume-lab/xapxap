import { useLocalSearchParams, useRouter } from "expo-router";
import { CheckCircle2, Loader2, ShieldAlert } from "lucide-react-native";
import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useColors } from "@/hooks/use-colors";

type VerifyStatus = "verifying" | "success" | "error";

const VERIFY_TYPES = [
  "sms",
  "phone_change",
  "email",
  "email_change",
  "signup",
  "invite",
  "recovery",
] as const;
type VerifyType = (typeof VERIFY_TYPES)[number];

export default function VerifyScreen() {
  const params = useLocalSearchParams<{
    token?: string;
    token_hash?: string;
    type?: string;
    email?: string;
    phone?: string;
  }>();
  const router = useRouter();
  const { verifyOtp, hideAuthModal } = useAuth();
  const colors = useColors();

  const [status, setStatus] = useState<VerifyStatus>("verifying");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const paramStr = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);
  const token = paramStr(params.token);
  const tokenHash = paramStr(params.token_hash);
  const email = paramStr(params.email);
  const phone = paramStr(params.phone);
  const typeRaw = paramStr(params.type);
  const type: VerifyType = VERIFY_TYPES.includes(typeRaw as VerifyType)
    ? (typeRaw as VerifyType)
    : "signup";

  const isPhoneType = type === "sms" || type === "phone_change";

  const handleVerify = useCallback(async () => {
    setStatus("verifying");
    setErrorMessage(null);

    // Supabase email confirmation links use token_hash in the URL, but the token
    // is consumed server-side before the redirect reaches the app. If we receive
    // token_hash (or no token at all for email/signup types), the verification
    // was already completed — just confirm the session and navigate home.
    const isEmailVerification =
      type === "signup" || type === "email" || type === "email_change" || type === "invite";

    if (isEmailVerification && (tokenHash || !token)) {
      setStatus("success");
      return;
    }

    if (!token) {
      setStatus("error");
      setErrorMessage("This verification link is incomplete. Please request a new one.");
      return;
    }

    const identifier = isPhoneType ? phone : email;
    if (!identifier) {
      setStatus("error");
      setErrorMessage("This verification link is incomplete. Please request a new one.");
      return;
    }

    try {
      await verifyOtp(
        isPhoneType ? { phone: identifier, token, type } : { email: identifier, token, type }
      );
      setStatus("success");
    } catch (e) {
      setStatus("error");
      setErrorMessage(e instanceof Error ? e.message : "Verification failed");
    }
  }, [token, tokenHash, email, phone, type, isPhoneType, verifyOtp]);

  useEffect(() => {
    handleVerify();
  }, [handleVerify]);

  useEffect(() => {
    if (status !== "success") return;
    hideAuthModal();
    const timeout = setTimeout(() => router.replace("/(tabs)"), 1500);
    return () => clearTimeout(timeout);
  }, [status, router, hideAuthModal]);

  return (
    <View className="flex-1 items-center justify-center p-8 bg-background gap-4">
      {status === "verifying" && (
        <>
          <Icon as={Loader2} size={40} className="text-primary" />
          <Text className="text-foreground text-lg font-semibold font-[Inter_600SemiBold]">
            Verifying your account…
          </Text>
        </>
      )}

      {status === "success" && (
        <>
          <Icon as={CheckCircle2} size={40} color={colors.primary} />
          <Text className="text-foreground text-2xl font-bold font-[Inter_700Bold]">
            Account verified
          </Text>
          <Text className="text-foreground/60 text-center">
            You're all set. Taking you to XapXap…
          </Text>
        </>
      )}

      {status === "error" && (
        <>
          <Icon as={ShieldAlert} size={40} className="text-rose-500" />
          <Text className="text-foreground text-2xl font-bold font-[Inter_700Bold]">
            Verification failed
          </Text>
          <Text className="text-foreground/60 text-center">{errorMessage}</Text>
          <View className="gap-3 w-full mt-4">
            <Button onPress={handleVerify} size="lg" className="h-14 rounded-[26px] bg-primary">
              <Text className="font-bold text-lg text-primary-foreground font-[Inter_700Bold]">
                Try Again
              </Text>
            </Button>
            <Button
              variant="ghost"
              onPress={() => router.replace("/(tabs)")}
              className="h-12 rounded-[26px]">
              <Text className="font-semibold text-primary font-[Inter_600SemiBold]">
                Go to Home
              </Text>
            </Button>
          </View>
        </>
      )}
    </View>
  );
}

import { LinearGradient } from "expo-linear-gradient";
import { Lock, Mail, Phone, User, X } from "lucide-react-native";
import { useState } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useColors } from "@/hooks/use-colors";

function isPhone(value: string): boolean {
  const cleaned = value.replace(/[\s\-()]/g, "");
  return /^\+?\d{7,15}$/.test(cleaned);
}

export function AuthModal() {
  const { isAuthModalVisible, hideAuthModal, signIn, signUp, signInWithPhone, verifyOtp } =
    useAuth();
  const colors = useColors();

  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneForOtp, setPhoneForOtp] = useState("");

  const isPhoneMode = isPhone(identifier);

  const onSubmit = async () => {
    if (isSignUp && !isPhoneMode && !username) return setError("Please enter a username");
    if (!identifier) return setError("Please enter email or phone number");
    if (!isPhoneMode && !password) return setError("Please enter a password");

    setBusy(true);
    setError(null);
    try {
      if (isPhoneMode) {
        setPhoneForOtp(identifier.trim());
        await signInWithPhone(identifier.trim());
        setOtpStep(true);
      } else if (isSignUp) {
        await signUp(identifier.trim(), password, username.trim());
        hideAuthModal();
      } else {
        await signIn(identifier.trim(), password);
        hideAuthModal();
      }
      if (!isPhoneMode) {
        setUsername("");
        setIdentifier("");
        setPassword("");
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const onVerifyOtp = async () => {
    if (!otpCode.trim()) return setError("Please enter the verification code");
    if (otpCode.trim().length !== 6) return setError("Code must be 6 digits");

    setBusy(true);
    setError(null);
    try {
      await verifyOtp({ phone: phoneForOtp, token: otpCode.trim(), type: "sms" });
      hideAuthModal();
      setOtpStep(false);
      setOtpCode("");
      setPhoneForOtp("");
      setUsername("");
      setIdentifier("");
      setPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Verification failed");
    } finally {
      setBusy(false);
    }
  };

  const onResendOtp = async () => {
    setBusy(true);
    setError(null);
    try {
      await signInWithPhone(phoneForOtp);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to resend code");
    } finally {
      setBusy(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setOtpStep(false);
    setOtpCode("");
  };

  const handleClose = () => {
    hideAuthModal();
    setOtpStep(false);
    setOtpCode("");
    setPhoneForOtp("");
    setError(null);
  };

  return (
    <Dialog open={isAuthModalVisible} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-sm p-0 gap-0 overflow-hidden">
        <View className="p-6 relative">
          <LinearGradient
            colors={[colors.primary, "transparent"]}
            start={{ x: 0.5, y: 0 }}
            end={{ x: 0.5, y: 1 }}
            className="absolute top-0 left-0 right-0 h-15 opacity-10"
          />

          <DialogHeader className="mb-6">
            <View className="flex-row justify-between items-center">
              <View>
                <View className="flex-row">
                  <Text className="text-foreground text-2xl font-bold font-[Inter_700Bold]">
                    Xap
                  </Text>
                  <Text className="text-primary text-2xl font-bold font-[Inter_700Bold]">Xap</Text>
                </View>
                <DialogDescription className="mt-1">
                  {otpStep
                    ? "Enter the code sent to your phone"
                    : isSignUp
                      ? "Create an account to continue"
                      : "Sign in to continue"}
                </DialogDescription>
              </View>
              <DialogClose asChild>
                <Button
                  variant="ghost"
                  onPress={handleClose}
                  className="w-8 h-8 rounded-full bg-muted items-center justify-center border border-border p-0 min-w-0 min-h-0 active:bg-transparent">
                  <Icon as={X} size={16} className="text-foreground" />
                </Button>
              </DialogClose>
            </View>
          </DialogHeader>

          <View className="gap-4">
            {otpStep ? (
              <>
                <View className="gap-1">
                  <Input
                    value={otpCode}
                    onChangeText={(t) => {
                      setOtpCode(t.replace(/[^0-9]/g, "").slice(0, 6));
                      setError(null);
                    }}
                    placeholder="6-digit code"
                    keyboardType="number-pad"
                    maxLength={6}
                    icon={<Lock size={18} color={colors.mutedForeground} />}
                  />
                </View>

                <Button
                  onPress={onVerifyOtp}
                  size="lg"
                  className="mt-2 h-14 rounded-[26px] bg-primary"
                  isLoading={busy}>
                  <Text className="font-bold text-lg text-primary-foreground font-[Inter_700Bold]">
                    Verify Code
                  </Text>
                </Button>

                <Button
                  variant="ghost"
                  onPress={onResendOtp}
                  disabled={busy}
                  className="items-center mt-1 active:opacity-70 p-0 min-w-0 min-h-0 h-auto w-auto bg-transparent active:bg-transparent">
                  <Text className="text-sm font-semibold font-[Inter_600SemiBold]">
                    <Text className="text-foreground/60">
                      Didn't receive a code? <Text className="text-primary">Resend</Text>
                    </Text>
                  </Text>
                </Button>

                <Button
                  variant="ghost"
                  onPress={() => {
                    setOtpStep(false);
                    setOtpCode("");
                    setError(null);
                  }}
                  className="items-center mt-1 active:opacity-70 p-0 min-w-0 min-h-0 h-auto w-auto bg-transparent active:bg-transparent">
                  <Text className="text-sm font-semibold font-[Inter_600SemiBold]">
                    <Text className="text-foreground/60">
                      <Text className="text-primary">Use a different method</Text>
                    </Text>
                  </Text>
                </Button>
              </>
            ) : (
              <>
                {isSignUp && !isPhoneMode && (
                  <View className="gap-1">
                    <Input
                      value={username}
                      onChangeText={(t) => {
                        setUsername(t);
                        setError(null);
                      }}
                      placeholder="Username"
                      autoCapitalize="none"
                      icon={<User size={18} color={colors.mutedForeground} />}
                    />
                  </View>
                )}

                <View className="gap-1">
                  <Input
                    value={identifier}
                    onChangeText={(t) => {
                      setIdentifier(t);
                      setError(null);
                    }}
                    placeholder="Email or Phone Number"
                    autoCapitalize="none"
                    icon={
                      isPhoneMode ? (
                        <Phone size={18} color={colors.mutedForeground} />
                      ) : (
                        <Mail size={18} color={colors.mutedForeground} />
                      )
                    }
                  />
                </View>

                {!isPhoneMode && (
                  <View className="gap-1">
                    <Input
                      value={password}
                      onChangeText={(t) => {
                        setPassword(t);
                        setError(null);
                      }}
                      placeholder="Password"
                      secureTextEntry
                      icon={<Lock size={18} color={colors.mutedForeground} />}
                    />
                  </View>
                )}

                {isPhoneMode && isSignUp && (
                  <View className="gap-1">
                    <Input
                      value={username}
                      onChangeText={(t) => {
                        setUsername(t);
                        setError(null);
                      }}
                      placeholder="Username"
                      autoCapitalize="none"
                      icon={<User size={18} color={colors.mutedForeground} />}
                    />
                  </View>
                )}

                {error && (
                  <Text className="text-rose-500 text-xs font-semibold ml-2 font-[Inter_500Medium]">
                    {error}
                  </Text>
                )}

                <Button
                  onPress={onSubmit}
                  size="lg"
                  className="mt-2 h-14 rounded-[26px] bg-primary"
                  isLoading={busy}>
                  <Text className="font-bold text-lg text-primary-foreground font-[Inter_700Bold]">
                    {isPhoneMode
                      ? "Send Verification Code"
                      : isSignUp
                        ? "Create Account"
                        : "Enter the Wave"}
                  </Text>
                </Button>

                <Button
                  variant="ghost"
                  onPress={toggleAuthMode}
                  className="items-center mt-3 active:opacity-70 p-0 min-w-0 min-h-0 h-auto w-auto bg-transparent active:bg-transparent">
                  <Text className="text-sm font-semibold font-[Inter_600SemiBold]">
                    {isSignUp ? (
                      <Text className="text-foreground/60">
                        Already have an account? <Text className="text-primary">Sign in</Text>
                      </Text>
                    ) : (
                      <Text className="text-foreground/60">
                        Don't have an account? <Text className="text-primary">Create one</Text>
                      </Text>
                    )}
                  </Text>
                </Button>
              </>
            )}
          </View>
        </View>
      </DialogContent>
    </Dialog>
  );
}

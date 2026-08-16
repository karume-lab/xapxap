import { LinearGradient } from "expo-linear-gradient";
import { CheckCircle2, Info, Lock, Mail, Phone, User, X } from "lucide-react-native";
import { useCallback, useEffect, useRef, useState } from "react";
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isPhone(value: string): boolean {
  const cleaned = value.replace(/[\s\-()]/g, "");
  return /^\+?\d{7,15}$/.test(cleaned);
}

const FRIENDLY_ERRORS: Array<[RegExp, string]> = [
  [/invalid login credentials/i, "Incorrect email or password. Please try again."],
  [
    /email not confirmed/i,
    "Your email isn't confirmed yet. Check your inbox for the confirmation link.",
  ],
  [/already registered/i, "An account with this email already exists. Try signing in instead."],
  [
    /user already exists/i,
    "An account with this phone number already exists. Try signing in instead.",
  ],
  [
    /signups not allowed/i,
    "Sign-ups are currently disabled for this method. Please use a different method.",
  ],
  [/at least 6 characters/i, "Your password must be at least 6 characters long."],
  [/otp.*expired|token.*expired/i, "That code has expired. Request a new one."],
  [
    /invalid.*otp|otp.*invalid|token.*invalid/i,
    "That code is incorrect or has expired. Request a new one.",
  ],
  [/rate limit/i, "Too many attempts. Please wait a moment and try again."],
  [
    /smtp|failed to send|failed to deliver/i,
    "We couldn't send the email. Please try again in a moment.",
  ],
  [
    /network|fetch failed|failed to fetch|timeout/i,
    "Network error. Check your connection and try again.",
  ],
];

function friendlyError(e: unknown): string {
  const raw = e instanceof Error ? e.message : "";
  if (!raw) return "Something went wrong. Please try again.";
  for (const [re, friendly] of FRIENDLY_ERRORS) {
    if (re.test(raw)) return friendly;
  }
  return raw;
}

export function AuthModal() {
  const {
    isAuthModalVisible,
    hideAuthModal,
    signIn,
    signUp,
    signInWithPhone,
    verifyOtp,
    resendSignUpEmail,
  } = useAuth();
  const colors = useColors();

  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [phoneForOtp, setPhoneForOtp] = useState("");
  const [emailConfirmStep, setEmailConfirmStep] = useState(false);
  const submittedSignUpRef = useRef<{ email: string; password: string; username: string } | null>(
    null
  );

  const isPhoneMode = isPhone(identifier);

  const resetForm = useCallback(() => {
    setUsername("");
    setIdentifier("");
    setPassword("");
    setOtpCode("");
    setPhoneForOtp("");
    setError(null);
    setNotice(null);
    setOtpStep(false);
    setEmailConfirmStep(false);
    setIsSignUp(false);
  }, []);

  const onSubmit = async () => {
    const identifierTrimmed = identifier.trim();
    const phoneMode = isPhone(identifierTrimmed);

    if (!identifierTrimmed) return setError("Please enter your email or phone number.");
    if (!phoneMode && !EMAIL_RE.test(identifierTrimmed)) {
      return setError("Please enter a valid email address.");
    }
    if (isSignUp && !username.trim()) return setError("Please choose a username.");
    if (!phoneMode && !password) return setError("Please enter a password.");
    if (!phoneMode && password.length < 6) {
      return setError("Your password must be at least 6 characters.");
    }

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      if (phoneMode) {
        setPhoneForOtp(identifierTrimmed);
        await signInWithPhone(identifierTrimmed, isSignUp ? username.trim() : undefined);
        setOtpStep(true);
      } else if (isSignUp) {
        submittedSignUpRef.current = {
          email: identifierTrimmed,
          password,
          username: username.trim(),
        };
        const { needsConfirmation } = await signUp(identifierTrimmed, password, username.trim());
        if (needsConfirmation) {
          setEmailConfirmStep(true);
        } else {
          hideAuthModal();
          resetForm();
        }
      } else {
        await signIn(identifierTrimmed, password);
        hideAuthModal();
        resetForm();
      }
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const onVerifyOtp = async () => {
    if (!otpCode.trim()) return setError("Please enter the verification code.");
    if (otpCode.trim().length !== 6) return setError("The code must be 6 digits.");

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await verifyOtp({ phone: phoneForOtp, token: otpCode.trim(), type: "sms" });
      hideAuthModal();
      resetForm();
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const onResendOtp = async () => {
    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await signInWithPhone(phoneForOtp, isSignUp ? username.trim() : undefined);
      setNotice(`A new code was sent to ${phoneForOtp}.`);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const onResendEmail = async () => {
    const creds = submittedSignUpRef.current;
    if (!creds) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    try {
      await resendSignUpEmail(creds.email);
      setNotice(`We resent the confirmation link to ${creds.email}.`);
    } catch (e) {
      setError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
    setNotice(null);
    setOtpStep(false);
    setOtpCode("");
    setEmailConfirmStep(false);
  };

  const backToSignIn = () => {
    setEmailConfirmStep(false);
    setIsSignUp(false);
    setPassword("");
    setError(null);
    setNotice(null);
  };

  const handleClose = () => {
    hideAuthModal();
    resetForm();
  };

  // Reset the form whenever the dialog closes for any reason (user close, or
  // auto-dismiss when a session is established) so it never reopens in a stale
  // "check your email / resend" step.
  useEffect(() => {
    if (!isAuthModalVisible) resetForm();
  }, [isAuthModalVisible, resetForm]);

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
                    : emailConfirmStep
                      ? "Activate your account"
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
            {emailConfirmStep ? (
              <>
                <View className="items-center gap-3 py-2">
                  <View className="w-16 h-16 rounded-full bg-emerald-500/10 items-center justify-center">
                    <Icon as={CheckCircle2} size={32} className="text-emerald-500" />
                  </View>
                  <Text className="text-foreground text-xl font-bold text-center font-[Inter_700Bold]">
                    Check your email
                  </Text>
                  <Text className="text-foreground/60 text-sm text-center leading-5">
                    We sent a confirmation link to{"\n"}
                    <Text className="text-foreground font-semibold">
                      {submittedSignUpRef.current?.email ?? identifier}
                    </Text>
                    {"."} Tap it to activate your account, then sign in.
                  </Text>
                  <Text className="text-foreground/40 text-xs text-center leading-4">
                    Didn't get it? Check your spam folder, or resend the link below.
                  </Text>
                </View>

                {notice && (
                  <Text className="text-emerald-500 text-xs font-semibold ml-2 font-[Inter_500Medium]">
                    {notice}
                  </Text>
                )}
                {error && (
                  <Text className="text-rose-500 text-xs font-semibold ml-2 font-[Inter_500Medium]">
                    {error}
                  </Text>
                )}

                <Button
                  onPress={onResendEmail}
                  size="lg"
                  className="mt-2 h-14 rounded-[26px] bg-primary"
                  isLoading={busy}>
                  <Text className="font-bold text-lg text-primary-foreground font-[Inter_700Bold]">
                    Resend email
                  </Text>
                </Button>

                <Button
                  variant="ghost"
                  onPress={backToSignIn}
                  disabled={busy}
                  className="items-center mt-1 active:opacity-70 p-0 min-w-0 min-h-0 h-auto w-auto bg-transparent active:bg-transparent">
                  <Text className="text-sm font-semibold font-[Inter_600SemiBold]">
                    <Text className="text-foreground/60">
                      Already confirmed? <Text className="text-primary">Sign in</Text>
                    </Text>
                  </Text>
                </Button>
              </>
            ) : otpStep ? (
              <>
                <View className="flex-row items-start gap-2 bg-emerald-500/10 rounded-2xl px-3 py-2.5">
                  <Icon as={Info} size={16} className="text-emerald-500 mt-0.5" />
                  <Text className="text-emerald-600 dark:text-emerald-400 text-xs flex-1 leading-4 font-[Inter_500Medium]">
                    We sent a 6-digit code to {phoneForOtp}. Enter it below to{" "}
                    {isSignUp ? "create your account" : "sign in"}.
                  </Text>
                </View>

                <View className="gap-1">
                  <Input
                    value={otpCode}
                    onChangeText={(t) => {
                      setOtpCode(t.replace(/[^0-9]/g, "").slice(0, 6));
                      setError(null);
                      setNotice(null);
                    }}
                    placeholder="6-digit code"
                    keyboardType="number-pad"
                    maxLength={6}
                    icon={<Lock size={18} color={colors.mutedForeground} />}
                  />
                </View>

                {error && (
                  <Text className="text-rose-500 text-xs font-semibold ml-2 font-[Inter_500Medium]">
                    {error}
                  </Text>
                )}
                {notice && (
                  <Text className="text-emerald-500 text-xs font-semibold ml-2 font-[Inter_500Medium]">
                    {notice}
                  </Text>
                )}

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
                    setNotice(null);
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
                <View className="flex-row items-start gap-2 bg-muted rounded-2xl px-3 py-2.5">
                  <Icon as={Info} size={16} className="text-foreground/40 mt-0.5" />
                  <Text className="text-foreground/60 text-xs flex-1 leading-4 font-[Inter_400Regular]">
                    {isSignUp
                      ? "Pick a username and a login method. You can use an email and password, or your phone number with a one-time code."
                      : "Sign in with the email and password you used to create your account, or use your phone number for a one-time code."}
                  </Text>
                </View>

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
                      setNotice(null);
                    }}
                    placeholder="Email or Phone Number"
                    autoCapitalize="none"
                    keyboardType={isPhoneMode ? "phone-pad" : "email-address"}
                    icon={
                      isPhoneMode ? (
                        <Phone size={18} color={colors.mutedForeground} />
                      ) : (
                        <Mail size={18} color={colors.mutedForeground} />
                      )
                    }
                  />
                  {isPhoneMode && (
                    <Text className="text-foreground/40 text-xs ml-2 font-[Inter_400Regular]">
                      Include your country code, e.g. +254 712 345 678
                    </Text>
                  )}
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
                    {isSignUp && (
                      <Text className="text-foreground/40 text-xs ml-2 font-[Inter_400Regular]">
                        At least 6 characters
                      </Text>
                    )}
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
                {notice && (
                  <Text className="text-emerald-500 text-xs font-semibold ml-2 font-[Inter_500Medium]">
                    {notice}
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

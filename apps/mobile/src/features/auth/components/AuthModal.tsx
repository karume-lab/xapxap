import { LinearGradient } from "expo-linear-gradient";
import { Lock, Mail, User, X } from "lucide-react-native";
import { useState } from "react";
import { Modal, Pressable, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useColors } from "@/hooks/use-colors";

export function AuthModal() {
  const { isAuthModalVisible, hideAuthModal, signIn, signUp } = useAuth();
  const colors = useColors();

  const [isSignUp, setIsSignUp] = useState(false);
  const [username, setUsername] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (isSignUp && !username) return setError("Please enter a username");
    if (!identifier || !password) return setError("Please enter email/phone and password");

    setBusy(true);
    setError(null);
    try {
      if (isSignUp) {
        await signUp(identifier.trim(), password, username.trim());
      } else {
        await signIn(identifier.trim(), password);
      }
      hideAuthModal();
      setUsername("");
      setIdentifier("");
      setPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Authentication failed");
    } finally {
      setBusy(false);
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setError(null);
  };

  if (!isAuthModalVisible) return null;

  return (
    <Modal
      visible={isAuthModalVisible}
      transparent
      animationType="fade"
      onRequestClose={hideAuthModal}>
      {/* Semi-transparent Overlay */}
      <Pressable
        onPress={hideAuthModal}
        className="flex-1 bg-background/75 items-center justify-center p-6">
        {/* Prevent clicks from propagating to the overlay */}
        <Pressable className="w-full max-w-100">
          <View className="w-full p-6 bg-background border border-border rounded-3xl relative overflow-hidden">
            {/* Top Premium Color Accent Glow */}
            <LinearGradient
              colors={[colors.primary, "transparent"]}
              start={{ x: 0.5, y: 0 }}
              end={{ x: 0.5, y: 1 }}
              className="absolute top-0 left-0 right-0 h-15 opacity-10"
            />

            {/* Modal Header */}
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <View className="flex-row">
                  <Text className="text-foreground text-2xl font-bold font-[Inter_700Bold]">
                    Xap
                  </Text>
                  <Text className="text-primary text-2xl font-bold font-[Inter_700Bold]">Xap</Text>
                </View>
                <Text className="text-muted-foreground mt-1 text-sm font-[Inter_400Regular]">
                  {isSignUp ? "Create an account to continue" : "Sign in to continue"}
                </Text>
              </View>
              <Button
                variant="ghost"
                onPress={hideAuthModal}
                className="w-8 h-8 rounded-full bg-muted items-center justify-center border border-border p-0 min-w-0 min-h-0 active:bg-transparent">
                <Icon as={X} size={16} className="text-foreground" />
              </Button>
            </View>

            {/* Form Fields */}
            <View className="gap-4">
              {isSignUp && (
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
                  icon={<Mail size={18} color={colors.mutedForeground} />}
                />
              </View>

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
                  {isSignUp ? "Create Account" : "Enter the Wave"}
                </Text>
              </Button>

              {/* Mode Toggle Footer */}
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
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

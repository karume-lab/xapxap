import { LinearGradient } from "expo-linear-gradient";
import { LockIcon, MailIcon, XIcon } from "lucide-react-native";
import { useState } from "react";
import { Modal, StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useColors } from "@/hooks/use-colors";

export function AuthModal() {
  const { isAuthModalVisible, hideAuthModal, signIn } = useAuth();
  const colors = useColors();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async () => {
    if (!email || !password) return setError("Please enter email and password");
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password);
      hideAuthModal();
      setEmail("");
      setPassword("");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not sign in");
    } finally {
      setBusy(false);
    }
  };

  if (!isAuthModalVisible) return null;

  return (
    <Modal
      visible={isAuthModalVisible}
      transparent
      animationType="fade"
      onRequestClose={hideAuthModal}>
      <TouchableWithoutFeedback onPress={hideAuthModal}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.card,
                { backgroundColor: colors.background, borderColor: colors.border },
              ]}>
              <LinearGradient
                colors={["#1A0A2E", "transparent"]}
                className="absolute top-0 left-0 right-0 h-[100px] opacity-30 rounded-t-3xl"
              />

              <View className="flex-row justify-between items-center mb-6">
                <View>
                  <Text className="text-foreground font-bold text-2xl font-[Inter_700Bold]">
                    Xap<Text className="text-primary">Xap</Text>
                  </Text>
                  <Text className="text-muted-foreground mt-1 text-sm font-[Inter_400Regular]">
                    Sign in to continue
                  </Text>
                </View>
                <Button
                  variant="ghost"
                  size="icon"
                  onPress={hideAuthModal}
                  className="h-8 w-8 rounded-full">
                  <XIcon size={20} color={colors.foreground} />
                </Button>
              </View>

              <View className="gap-4">
                <View className="gap-1">
                  <Input
                    value={email}
                    onChangeText={(t) => {
                      setEmail(t);
                      setError(null);
                    }}
                    placeholder="Email"
                    autoCapitalize="none"
                    keyboardType="email-address"
                    icon={<MailIcon size={18} color={colors.mutedForeground} />}
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
                    icon={<LockIcon size={18} color={colors.mutedForeground} />}
                  />
                </View>

                {error && <Text className="text-destructive text-xs ml-2">{error}</Text>}

                <Button
                  onPress={onSubmit}
                  size="lg"
                  className="mt-2 h-14 rounded-[26px]"
                  isLoading={busy}>
                  <Text className="font-bold text-lg text-primary-foreground">Enter the wave</Text>
                </Button>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.7)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  card: {
    width: "100%",
    maxWidth: 400,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
    overflow: "hidden",
  },
});

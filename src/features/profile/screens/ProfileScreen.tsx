import {
  AlertTriangleIcon,
  AnchorIcon,
  Calendar,
  ChevronRightIcon,
  GlobeIcon,
  LogOut,
  ShieldCheckIcon,
  Wifi,
  WifiOff,
  Zap,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, ScrollView, Switch, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useDataSaver } from "@/contexts/data-saver-context";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

const CURRENCIES = [
  { code: "USD", flag: "🇺🇸" },
  { code: "KES", flag: "🇰🇪" },
  { code: "TZS", flag: "🇹🇿" },
  { code: "ZMW", flag: "🇿🇲" },
  { code: "NGN", flag: "🇳🇬" },
];

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { profile, session, signOut, updateProfile, showAuthModal } = useAuth();
  const { dataSaver, toggle: toggleDataSaver } = useDataSaver();

  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [currency, setCurrency] = useState("KES");
  const [isSaving, setIsSaving] = useState(false);

  if (!session) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center p-6"
        style={{ paddingTop: insets.top }}>
        <View className="w-20 h-20 rounded-full bg-primary/10 items-center justify-center mb-6 border border-primary/20">
          <Icon as={AnchorIcon} size={36} className="text-primary" />
        </View>
        <Text className="text-foreground font-bold text-2xl text-center mb-2 font-[Inter_700Bold]">
          Your Space
        </Text>
        <Text className="text-muted-foreground text-center text-sm leading-6 max-w-[280px] mb-8 font-[Inter_400Regular]">
          Sign in to customize your profile, collect gems, track your waves, and manage your
          account.
        </Text>
        <Button
          onPress={showAuthModal}
          className="w-full max-w-[240px] h-16 rounded-[28px] bg-primary">
          <Text className="text-primary-foreground font-bold text-lg font-[Inter_700Bold]">
            Sign in to XapXap
          </Text>
        </Button>
      </View>
    );
  }

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ username, bio });
      Alert.alert("Success", "Profile updated successfully");
    } catch (_) {
      Alert.alert("Error", "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const isCaptain = profile?.role === "captain";

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      {/* Top Gem Capsule */}
      <View className="items-center mb-6">
        <Glass radius={20} className="px-4 py-2 border border-primary/20 bg-primary/5">
          <View className="flex-row items-center gap-2">
            <Icon as={Zap} size={14} className="text-primary" />
            <Text className="text-primary font-bold text-xs">52 gems ≈ KSh68</Text>
          </View>
        </Glass>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}>
        {/* Profile Section */}
        <View className="px-6 mb-8">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">
            Profile
          </Text>

          <View className="gap-4">
            <Glass radius={24} className="p-5 border border-border">
              <Text className="text-muted-foreground text-[10px] font-bold uppercase mb-2 ml-1">
                Username
              </Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                className="text-foreground text-lg font-bold"
                placeholder="Username"
              />
            </Glass>

            <Glass radius={24} className="p-5 border border-border min-h-[120px]">
              <Text className="text-muted-foreground text-[10px] font-bold uppercase mb-2 ml-1">
                Bio
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                className="text-foreground text-base leading-6"
                placeholder="Tell people what you're about..."
                placeholderTextColor={colors.mutedForeground}
              />
            </Glass>

            <Button
              onPress={handleSave}
              isLoading={isSaving}
              className="h-16 rounded-[28px] bg-primary">
              <View className="flex-row items-center gap-2">
                <Icon as={ShieldCheckIcon} size={18} className="text-primary-foreground" />
                <Text className="text-primary-foreground font-bold text-lg">Save changes</Text>
              </View>
            </Button>
          </View>
        </View>

        {/* Command Centre */}
        <View className="px-6 mb-8">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">
            Command Centre
          </Text>

          <View className="gap-3">
            <Glass radius={24} className="p-5 border border-border flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mr-4">
                <Icon as={dataSaver ? WifiOff : Wifi} size={24} className="text-primary" />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-bold text-base">Data Saver Mode</Text>
                <Text className="text-muted-foreground text-xs">
                  Compress images and pause video autoplay.
                </Text>
              </View>
              <Switch
                value={dataSaver}
                onValueChange={toggleDataSaver}
                trackColor={{ true: colors.primary, false: colors.muted }}
                thumbColor={colors.foreground}
              />
            </Glass>

            <Glass radius={24} className="p-5 border border-border">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 rounded-2xl bg-accent/10 items-center justify-center mr-4">
                  <Icon as={GlobeIcon} size={24} className="text-accent" />
                </View>
                <View className="flex-1">
                  <Text className="text-foreground font-bold text-base">Currency</Text>
                  <Text className="text-muted-foreground text-xs">
                    Display gem value in your local currency. 🇰🇪 Kenyan Shilling
                  </Text>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {CURRENCIES.map((c) => (
                  <Button
                    key={c.code}
                    variant="ghost"
                    onPress={() => setCurrency(c.code)}
                    className={cn(
                      "flex-row items-center rounded-full mr-2 border active:bg-transparent bg-transparent p-0 min-w-0 min-h-0 h-auto w-auto",
                      currency === c.code
                        ? "bg-primary/20 border-primary"
                        : "bg-muted border-border"
                    )}>
                    <View className="flex-row items-center px-4 py-2">
                      <Text className="mr-2">{c.flag}</Text>
                      <Text
                        className={cn(
                          "font-bold text-xs",
                          currency === c.code ? "text-primary" : "text-foreground"
                        )}>
                        {c.code}
                      </Text>
                    </View>
                  </Button>
                ))}
              </ScrollView>
            </Glass>

            <Glass radius={24} className="p-5 border border-border flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-accent/10 items-center justify-center mr-4">
                <Icon as={Calendar} size={24} className="text-accent" />
              </View>
              <View className="flex-1">
                <Text className="text-foreground font-bold text-base">Date of birth</Text>
                <Text className="text-muted-foreground text-xs">
                  {profile?.dateOfBirth
                    ? new Date(profile.dateOfBirth).toLocaleDateString()
                    : "25/10/1970"}
                </Text>
              </View>
            </Glass>
          </View>
        </View>

        {/* Account Section */}
        <View className="px-6 mb-8">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">
            Account
          </Text>
          <Glass radius={24} className="overflow-hidden border border-border">
            <Button
              variant="ghost"
              onPress={signOut}
              className="h-16 flex-row items-center justify-center gap-3 p-0 min-w-0 min-h-0 w-full bg-transparent active:bg-transparent">
              <View className="flex-row items-center justify-center gap-3">
                <Icon as={LogOut} size={20} className="text-foreground" />
                <Text className="text-foreground font-bold text-base">Sign out</Text>
              </View>
            </Button>
          </Glass>
        </View>

        {/* Captain Command Centre (Conditional) */}
        {isCaptain && (
          <View className="px-6">
            <View className="flex-row items-center mb-4 gap-2">
              <Icon as={AnchorIcon} size={16} className="text-destructive" />
              <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Admin Portal
              </Text>
            </View>
            <Glass className="p-4 border border-destructive/20" radius={24}>
              <Button
                variant="ghost"
                className="flex-row items-center py-3 p-0 min-w-0 min-h-0 h-auto w-full bg-transparent active:bg-transparent">
                <View className="flex-row items-center w-full">
                  <View className="w-10 h-10 rounded-xl bg-destructive/10 items-center justify-center mr-4">
                    <Icon as={AlertTriangleIcon} size={20} className="text-destructive" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-foreground font-bold text-left">Mod Panel</Text>
                    <Text className="text-muted-foreground text-xs text-left">
                      Manage reported waves
                    </Text>
                  </View>
                  <Icon as={ChevronRightIcon} size={20} className="text-muted-foreground" />
                </View>
              </Button>
            </Glass>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

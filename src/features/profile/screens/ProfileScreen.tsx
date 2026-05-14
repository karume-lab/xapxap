import {
  AlertTriangleIcon,
  AnchorIcon,
  CalendarIcon,
  ChevronRightIcon,
  GlobeIcon,
  LogOutIcon,
  ShieldCheckIcon,
  WifiIcon,
  WifiOffIcon,
  ZapIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Switch, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useDataSaver } from "@/contexts/data-saver-context";
import { useColors } from "@/hooks/use-colors";

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
  const { profile, signOut, updateProfile } = useAuth();
  const { dataSaver, toggle: toggleDataSaver } = useDataSaver();

  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [currency, setCurrency] = useState("KES");
  const [isSaving, setIsSaving] = useState(false);

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
            <Icon as={ZapIcon} size={14} className="text-primary" />
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
            <Glass radius={24} className="p-5 border border-white/5">
              <Text className="text-muted-foreground text-[10px] font-bold uppercase mb-2 ml-1">
                Username
              </Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                className="text-white text-lg font-bold"
                placeholder="Username"
              />
            </Glass>

            <Glass radius={24} className="p-5 border border-white/5 min-h-[120px]">
              <Text className="text-muted-foreground text-[10px] font-bold uppercase mb-2 ml-1">
                Bio
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                className="text-white text-base leading-6"
                placeholder="Tell people what you're about..."
                placeholderTextColor="rgba(255,255,255,0.3)"
              />
            </Glass>

            <Button
              onPress={handleSave}
              isLoading={isSaving}
              className="h-16 rounded-[28px] bg-primary">
              <View className="flex-row items-center gap-2">
                <Icon as={ShieldCheckIcon} size={18} className="text-black" />
                <Text className="text-black font-bold text-lg">Save changes</Text>
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
            <Glass radius={24} className="p-5 border border-white/5 flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-primary/10 items-center justify-center mr-4">
                <Icon as={dataSaver ? WifiOffIcon : WifiIcon} size={24} className="text-primary" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Data Saver Mode</Text>
                <Text className="text-muted-foreground text-xs">
                  Compress images and pause video autoplay.
                </Text>
              </View>
              <Switch
                value={dataSaver}
                onValueChange={toggleDataSaver}
                trackColor={{ true: colors.primary, false: "rgba(255,255,255,0.1)" }}
                thumbColor="#fff"
              />
            </Glass>

            <Glass radius={24} className="p-5 border border-white/5">
              <View className="flex-row items-center mb-4">
                <View className="w-12 h-12 rounded-2xl bg-accent/10 items-center justify-center mr-4">
                  <Icon as={GlobeIcon} size={24} className="text-accent" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold text-base">Currency</Text>
                  <Text className="text-muted-foreground text-xs">
                    Display gem value in your local currency. 🇰🇪 Kenyan Shilling
                  </Text>
                </View>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
                {CURRENCIES.map((c) => (
                  <Pressable
                    key={c.code}
                    onPress={() => setCurrency(c.code)}
                    className={`flex-row items-center px-4 py-2 rounded-full mr-2 border ${currency === c.code ? "bg-primary/20 border-primary" : "bg-white/5 border-white/10"}`}>
                    <Text className="mr-2">{c.flag}</Text>
                    <Text
                      className={`font-bold text-xs ${currency === c.code ? "text-primary" : "text-white"}`}>
                      {c.code}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Glass>

            <Glass radius={24} className="p-5 border border-white/5 flex-row items-center">
              <View className="w-12 h-12 rounded-2xl bg-accent/10 items-center justify-center mr-4">
                <Icon as={CalendarIcon} size={24} className="text-accent" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold text-base">Date of birth</Text>
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
          <Glass radius={24} className="overflow-hidden border border-white/5">
            <Pressable
              onPress={signOut}
              className="h-16 flex-row items-center justify-center gap-3 active:bg-white/5">
              <Icon as={LogOutIcon} size={20} className="text-white" />
              <Text className="text-white font-bold text-base">Sign out</Text>
            </Pressable>
          </Glass>
        </View>

        {/* Captain Command Centre (Conditional) */}
        {isCaptain && (
          <View className="px-6">
            <View className="flex-row items-center mb-4 gap-2">
              <Icon as={AnchorIcon} size={16} className="text-[#FF5FA8]" />
              <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Admin Portal
              </Text>
            </View>
            <Glass className="p-4 border border-[#FF5FA8]/20" radius={24}>
              <Pressable className="flex-row items-center py-3">
                <View className="w-10 h-10 rounded-xl bg-[#FF5FA8]/10 items-center justify-center mr-4">
                  <Icon as={AlertTriangleIcon} size={20} className="text-[#FF5FA8]" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold">Mod Panel</Text>
                  <Text className="text-muted-foreground text-xs">Manage reported waves</Text>
                </View>
                <Icon as={ChevronRightIcon} size={20} className="text-muted-foreground" />
              </Pressable>
            </Glass>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

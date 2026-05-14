import {
  AlertTriangleIcon,
  AnchorIcon,
  CameraIcon,
  ChevronRightIcon,
  LogOutIcon,
  SettingsIcon,
  ShieldCheckIcon,
  WifiIcon,
  WifiOffIcon,
  ZapIcon,
} from "lucide-react-native";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Switch, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useDataSaver } from "@/contexts/data-saver-context";
import { useColors } from "@/hooks/use-colors";

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { profile, signOut, updateProfile } = useAuth();
  const { dataSaver, toggle: toggleDataSaver } = useDataSaver();

  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [isHereNow, setIsHereNow] = useState(true);
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

  const isCaptain = profile?.role === "captain" || true; // Mocking for demo

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}>
        <View className="px-6 py-4 flex-row justify-between items-center">
          <Text variant="h1" className="text-white">
            My Space
          </Text>
          <Pressable className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
            <Icon as={SettingsIcon} size={20} className="text-white" />
          </Pressable>
        </View>

        {/* Profile Identity Card */}
        <Glass
          intensity={30}
          className="mx-6 p-8 items-center border border-white/10 mt-4"
          radius={40}>
          <View className="relative">
            <Avatar username={profile?.username} size={100} ring />
            <Pressable className="absolute bottom-0 right-0 w-10 h-10 rounded-full bg-primary items-center justify-center border-4 border-[#06060b]">
              <Icon as={CameraIcon} size={16} className="text-black" />
            </Pressable>
          </View>
          <Text className="mt-4 font-bold text-2xl text-white">@{profile?.username}</Text>
          <View className="flex-row items-center mt-2 px-3 py-1 bg-primary/10 rounded-full border border-primary/20">
            <Icon as={ShieldCheckIcon} size={14} className="text-primary mr-1.5" />
            <Text className="text-primary font-bold text-[10px] uppercase tracking-widest">
              Verified Creator
            </Text>
          </View>

          <View className="flex-row mt-8 w-full justify-around">
            <View className="items-center">
              <Text className="text-white font-bold text-xl">1.2k</Text>
              <Text className="text-muted-foreground text-[10px] uppercase tracking-widest">
                Crew
              </Text>
            </View>
            <View className="h-10 w-px bg-white/10" />
            <View className="items-center">
              <Text className="text-white font-bold text-xl">450</Text>
              <Text className="text-muted-foreground text-[10px] uppercase tracking-widest">
                Tides
              </Text>
            </View>
            <View className="h-10 w-px bg-white/10" />
            <View className="items-center">
              <Text className="text-white font-bold text-xl">8.5k</Text>
              <Text className="text-muted-foreground text-[10px] uppercase tracking-widest">
                Fame
              </Text>
            </View>
          </View>
        </Glass>

        {/* Captain Command Centre (Conditional) */}
        {isCaptain && (
          <View className="mt-8 px-6">
            <View className="flex-row items-center mb-4 gap-2">
              <Icon as={AnchorIcon} size={16} className="text-[#FF5FA8]" />
              <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                Command Centre
              </Text>
            </View>
            <Glass className="p-4 border border-[#FF5FA8]/20" radius={24}>
              <Pressable className="flex-row items-center py-3">
                <View className="w-10 h-10 rounded-xl bg-[#FF5FA8]/10 items-center justify-center mr-4">
                  <Icon as={AlertTriangleIcon} size={20} className="text-[#FF5FA8]" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold">Warn Crew Member</Text>
                  <Text className="text-muted-foreground text-xs">
                    Issue an official tide warning
                  </Text>
                </View>
                <Icon as={ChevronRightIcon} size={20} className="text-muted-foreground" />
              </Pressable>
              <View className="h-px bg-white/5 my-1" />
              <Pressable className="flex-row items-center py-3">
                <View className="w-10 h-10 rounded-xl bg-destructive/10 items-center justify-center mr-4">
                  <Icon as={AnchorIcon} size={20} className="text-destructive" />
                </View>
                <View className="flex-1">
                  <Text className="text-white font-bold">Ban from the Tide</Text>
                  <Text className="text-muted-foreground text-xs">Permanently remove a user</Text>
                </View>
                <Icon as={ChevronRightIcon} size={20} className="text-muted-foreground" />
              </Pressable>
            </Glass>
          </View>
        )}

        {/* Profile Settings */}
        <View className="mt-8 px-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">
            Identity
          </Text>
          <Glass className="p-6 gap-6 border border-white/5" radius={24}>
            <View>
              <Text className="text-muted-foreground text-[10px] font-bold uppercase mb-2">
                Display Name
              </Text>
              <TextInput
                value={username}
                onChangeText={setUsername}
                className="text-white text-lg font-bold border-b border-white/10 pb-2"
                placeholder="Your username"
              />
            </View>
            <View>
              <Text className="text-muted-foreground text-[10px] font-bold uppercase mb-2">
                Ocean Bio
              </Text>
              <TextInput
                value={bio}
                onChangeText={setBio}
                multiline
                numberOfLines={3}
                className="text-white text-base leading-6 border-b border-white/10 pb-2"
                placeholder="Tell the crew about yourself..."
              />
            </View>
            <Button onPress={handleSave} isLoading={isSaving} className="mt-2 bg-primary">
              <Text className="text-black font-bold">Update My Space</Text>
            </Button>
          </Glass>
        </View>

        {/* System Settings */}
        <View className="mt-8 px-6">
          <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">
            Environment
          </Text>
          <Glass className="p-4 border border-white/5" radius={24}>
            <View className="flex-row items-center py-3">
              <View className="w-10 h-10 rounded-xl bg-primary/10 items-center justify-center mr-4">
                <Icon as={isHereNow ? ZapIcon : SettingsIcon} size={20} className="text-primary" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold">{isHereNow ? "Here Now" : "Away"}</Text>
                <Text className="text-muted-foreground text-xs">Visible to other hunters</Text>
              </View>
              <Switch
                value={isHereNow}
                onValueChange={setIsHereNow}
                trackColor={{ true: colors.primary, false: "rgba(255,255,255,0.1)" }}
                thumbColor="#fff"
              />
            </View>
            <View className="h-px bg-white/5 my-1" />
            <View className="flex-row items-center py-3">
              <View className="w-10 h-10 rounded-xl bg-accent/10 items-center justify-center mr-4">
                <Icon as={dataSaver ? WifiOffIcon : WifiIcon} size={20} className="text-accent" />
              </View>
              <View className="flex-1">
                <Text className="text-white font-bold">Data Saver Mode</Text>
                <Text className="text-muted-foreground text-xs">Optimize for low bandwidth</Text>
              </View>
              <Switch
                value={dataSaver}
                onValueChange={toggleDataSaver}
                trackColor={{ true: colors.accent, false: "rgba(255,255,255,0.1)" }}
                thumbColor="#fff"
              />
            </View>
          </Glass>
        </View>

        {/* Sign Out */}
        <View className="mt-8 px-6">
          <Button
            variant="outline"
            onPress={signOut}
            className="h-16 border-destructive/20 active:bg-destructive/10">
            <View className="flex-row items-center gap-2">
              <Icon as={LogOutIcon} size={18} className="text-destructive" />
              <Text className="text-destructive font-bold text-lg">Leave the Tide</Text>
            </View>
          </Button>
        </View>
      </ScrollView>
    </View>
  );
}

import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { ArrowLeft, Camera, ShieldCheckIcon } from "lucide-react-native";
import { useEffect, useState } from "react";
import { Pressable, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import { useColors } from "@/hooks/use-colors";
import { generateUUID, getMediaUrl, uploadMedia } from "@/lib/supabase";

export function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const { profile, updateProfile } = useAuth();

  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [isSaving, setIsSaving] = useState(false);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

  // Populate the form once the profile finishes loading (it resolves async).
  // `prev ||` preserves anything the user has already typed.
  useEffect(() => {
    if (!profile) return;
    setUsername((prev) => prev || profile.username || "");
    setBio((prev) => prev || profile.bio || "");
  }, [profile]);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  const showDialog = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const pickAvatar = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAvatarUri(result.assets[0].uri);
      }
    } catch {
      showDialog("Error", "Could not pick image.");
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const patch: Record<string, unknown> = { username, bio };

      if (avatarUri && profile) {
        const ext = "jpg";
        const path = `avatars/${profile.id}/${generateUUID()}.${ext}`;

        await uploadMedia({ uri: avatarUri, name: path, type: "image/jpeg" }, path);

        patch.avatarUrl = getMediaUrl(path);
      }

      await updateProfile(patch);
      showDialog("Success", "Profile updated successfully");
    } catch (_) {
      showDialog("Error", "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    // Navigate back after success — title will be "Success"
    if (dialogTitle === "Success") {
      router.back();
    }
  };

  const displayAvatar = avatarUri || profile?.avatarUrl;

  return (
    <View className="flex-1 bg-background">
      {/* Header */}
      <View style={{ paddingTop: insets.top + 10 }} className="px-4 pb-4 flex-row items-center">
        <Button
          variant="ghost"
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-muted items-center justify-center mr-4 p-0 min-w-0 min-h-0 active:bg-transparent">
          <Icon as={ArrowLeft} size={20} className="text-foreground" />
        </Button>
        <Text className="text-foreground font-bold text-lg">Edit Profile</Text>
      </View>

      <View className="flex-1 px-6 pt-2">
        <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">
          Edit Profile
        </Text>

        {/* Avatar Picker */}
        <View className="items-center mb-8">
          <Pressable onPress={pickAvatar} className="relative">
            <Avatar url={displayAvatar} username={profile?.username} size={100} ring />
            <View className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary items-center justify-center border-2 border-background">
              <Icon as={Camera} size={14} className="text-primary-foreground" />
            </View>
          </Pressable>
          <Text className="text-muted-foreground text-xs mt-2">Tap to change photo</Text>
        </View>

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
              placeholderTextColor={colors.mutedForeground}
            />
          </Glass>

          <Glass radius={24} className="p-5 border border-border min-h-30">
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
            className="h-16 rounded-[28px] bg-primary mt-4">
            <View className="flex-row items-center gap-2">
              <Icon as={ShieldCheckIcon} size={18} className="text-primary-foreground" />
              <Text className="text-primary-foreground font-bold text-lg">Save changes</Text>
            </View>
          </Button>
        </View>
      </View>

      {/* In-app alert dialog */}
      <Dialog open={dialogOpen} onOpenChange={handleDialogClose}>
        <DialogContent className="mx-6">
          <DialogHeader>
            <DialogTitle>{dialogTitle}</DialogTitle>
            <DialogDescription>{dialogMessage}</DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-2">
            <Button onPress={handleDialogClose} className="rounded-full">
              <Text className="text-primary-foreground font-bold">OK</Text>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </View>
  );
}

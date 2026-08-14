import { useRouter } from "expo-router";
import { ArrowLeft, ShieldCheckIcon } from "lucide-react-native";
import { useState } from "react";
import { TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
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

export function EditProfileScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
  const { profile, updateProfile } = useAuth();

  const [username, setUsername] = useState(profile?.username ?? "");
  const [bio, setBio] = useState(profile?.bio ?? "");
  const [isSaving, setIsSaving] = useState(false);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogMessage, setDialogMessage] = useState("");

  const showDialog = (title: string, message: string) => {
    setDialogTitle(title);
    setDialogMessage(message);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateProfile({ username, bio });
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

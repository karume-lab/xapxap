import { MessageCircleIcon, SendIcon, XIcon } from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";

interface CommentsSheetProps {
  onClose: () => void;
}

export function CommentsSheet({ onClose }: CommentsSheetProps) {
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const [comment, setComment] = useState("");

  return (
    <View className="flex-1 bg-[#0A0A0F] rounded-t-[40px] overflow-hidden border-t border-white/10">
      {/* Drag Handle */}
      <View className="items-center pt-3 pb-1">
        <View className="w-10 h-1 rounded-full bg-white/20" />
      </View>

      {/* Header */}
      <View className="px-6 py-4 flex-row justify-between items-center border-b border-white/5">
        <Text className="text-white font-bold text-lg">Comments</Text>
        <Pressable
          onPress={onClose}
          className="w-8 h-8 rounded-full bg-white/5 items-center justify-center">
          <Icon as={XIcon} size={18} className="text-white" />
        </Pressable>
      </View>

      <ScrollView className="flex-1" contentContainerStyle={{ flexGrow: 1 }}>
        {/* Empty State */}
        <View className="flex-1 items-center justify-center p-12">
          <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-6">
            <Icon as={MessageCircleIcon} size={40} className="text-white/20" />
          </View>
          <Text className="text-muted-foreground text-center text-sm leading-6">
            No comments yet. Be the first to start the conversation.
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Bar */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={100}>
        <Glass
          radius={0}
          intensity={60}
          className="border-t border-white/10 px-6 py-4"
          style={{ paddingBottom: insets.bottom + 10 }}>
          <View className="flex-row items-center gap-3">
            <Avatar username={profile?.username || "me"} size={36} />
            <Glass
              radius={20}
              className="flex-1 h-12 justify-center px-4 border border-white/10 bg-white/5">
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Add a comment..."
                placeholderTextColor="rgba(255,255,255,0.3)"
                className="text-white text-sm font-medium"
              />
            </Glass>
            <Pressable
              className={`w-12 h-12 rounded-full items-center justify-center ${comment.trim() ? "bg-primary" : "bg-white/5"}`}>
              <Icon
                as={SendIcon}
                size={20}
                className={comment.trim() ? "text-black" : "text-muted-foreground"}
              />
            </Pressable>
          </View>
        </Glass>
      </KeyboardAvoidingView>
    </View>
  );
}

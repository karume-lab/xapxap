import { useRouter } from "expo-router";
import {
  AnchorIcon,
  Camera,
  Code,
  Heart,
  Map as MapIcon,
  Music,
  Star,
  TrendingUp,
  X,
} from "lucide-react-native";
import { useState } from "react";
import { ScrollView, Switch, TextInput, View } from "react-native";
import { Glass } from "@/components/layout/Glass";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useColors } from "@/hooks/use-colors";

const CATEGORIES = [
  { id: "general", label: "General", icon: AnchorIcon },
  { id: "music", label: "Music", icon: Music },
  { id: "photos", label: "Photos", icon: Camera },
  { id: "travel", label: "Travel", icon: MapIcon },
  { id: "finance", label: "Finance", icon: TrendingUp },
  { id: "tech", label: "Tech", icon: Code },
  { id: "lifestyle", label: "Lifestyle", icon: Heart },
  { id: "fanclub", label: "Fan Club", icon: Star },
];

export function FleetCreateScreen() {
  const router = useRouter();
  const colors = useColors();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isOpenFleet, setIsOpenFleet] = useState(true);

  return (
    <View className="flex-1 bg-background pt-6">
      {/* Header */}
      <View className="px-6 flex-row items-center justify-between mb-8">
        <Text className="text-foreground font-bold text-2xl font-[Inter_700Bold]">
          Create Fleet Deck
        </Text>
        <Button
          variant="ghost"
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-muted items-center justify-center p-0 min-w-0 min-h-0 active:bg-transparent">
          <Icon as={X} size={20} className="text-foreground" />
        </Button>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        {/* Name Input */}
        <View className="mb-4">
          <Glass radius={24} className="p-5 border border-border">
            <TextInput
              value={name}
              onChangeText={(text) => {
                if (text.length <= 60) setName(text);
              }}
              className="text-foreground text-base"
              placeholder="Fleet deck name..."
              placeholderTextColor={colors.mutedForeground}
            />
          </Glass>
          <Text className="text-right text-muted-foreground text-xs mt-2 mr-2">
            {name.length}/60
          </Text>
        </View>

        {/* Description Input */}
        <View className="mb-8">
          <Glass radius={24} className="p-5 border border-border min-h-25">
            <TextInput
              value={description}
              onChangeText={(text) => {
                if (text.length <= 200) setDescription(text);
              }}
              multiline
              className="text-foreground text-base"
              placeholder="What's this deck about?\n(optional)"
              placeholderTextColor={colors.mutedForeground}
            />
          </Glass>
          <Text className="text-right text-muted-foreground text-xs mt-2 mr-2">
            {description.length}/200
          </Text>
        </View>

        {/* Categories */}
        <View className="mb-10">
          <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4 ml-1">
            CATEGORY (OPTIONAL)
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {CATEGORIES.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <Button
                  key={cat.id}
                  variant="ghost"
                  onPress={() => setSelectedCategory(isSelected ? null : cat.id)}
                  className={`flex-row items-center gap-2 px-4 py-2 rounded-full border p-0 min-w-0 min-h-0 h-10 active:bg-transparent ${isSelected ? "bg-primary/20 border-primary" : "bg-muted border-border"}`}>
                  <Icon
                    as={cat.icon}
                    size={14}
                    className={isSelected ? "text-primary" : "text-muted-foreground"}
                  />
                  <Text
                    className={`font-bold text-sm ${isSelected ? "text-primary" : "text-foreground"}`}>
                    {cat.label}
                  </Text>
                </Button>
              );
            })}
          </View>
        </View>

        {/* Open Fleet Toggle */}
        <View className="flex-row items-center justify-between mb-8">
          <View className="flex-1 mr-4">
            <Text className="text-foreground font-bold text-base mb-1">Open Fleet</Text>
            <Text className="text-muted-foreground text-sm leading-5">
              Anyone can discover and join this deck.
            </Text>
          </View>
          <Switch
            value={isOpenFleet}
            onValueChange={setIsOpenFleet}
            trackColor={{ true: colors.primary, false: colors.muted }}
            thumbColor={colors.foreground}
          />
        </View>

        {/* Info Card */}
        <Glass radius={24} className="p-5 border border-yellow-500/30 bg-yellow-500/5 mb-8">
          <View className="flex-row gap-4">
            <Icon as={Star} size={20} className="text-yellow-500 mt-0.5" />
            <Text className="text-yellow-500 text-sm leading-5 flex-1 font-bold">
              You'll be Captain of this deck — you can post, moderate, and invite crew members.
            </Text>
          </View>
        </Glass>

        {/* Launch Button */}
        <Button
          className="w-full h-16 rounded-full bg-primary mb-12 shadow-lg shadow-primary/20"
          onPress={() => {
            // Placeholder action
            router.back();
          }}>
          <View className="flex-row items-center justify-center gap-3">
            <Icon as={AnchorIcon} size={20} className="text-primary-foreground" />
            <Text className="text-primary-foreground font-bold text-lg">Launch Fleet Deck</Text>
          </View>
        </Button>
      </ScrollView>
    </View>
  );
}

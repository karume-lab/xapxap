import { Pressable, View } from "react-native";
import { Glass } from "@/components/ui/glass";
import { Text } from "@/components/ui/text";
import { useColors } from "@/hooks/use-colors";

export const AVAILABLE_TAGS = [
  { id: "music", label: "🎵 Music" },
  { id: "humor", label: "🤣 Humor" },
  { id: "gaming", label: "🎮 Gaming" },
  { id: "live", label: "📡 Live" },
  { id: "gems", label: "💎 Gems" },
  { id: "waves", label: "🌊 Waves" },
  { id: "fame", label: "🚀 Fame" },
  { id: "tech", label: "💡 Tech" },
];

interface TagSelectionSlideProps {
  selectedTags: string[];
  onToggleTag: (tagId: string) => void;
}

export function TagSelectionSlide({ selectedTags, onToggleTag }: TagSelectionSlideProps) {
  const colors = useColors();

  return (
    <Glass
      glow="lime"
      className="h-64 w-full p-4 justify-center items-center border border-zinc-800 shadow-2xl">
      <View className="flex-row flex-wrap justify-center gap-3 w-full">
        {AVAILABLE_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <Pressable
              key={tag.id}
              onPress={() => onToggleTag(tag.id)}
              style={[
                {
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  borderRadius: 20,
                  borderWidth: 1.5,
                  backgroundColor: isSelected ? `${colors.primary}26` : "rgba(255, 255, 255, 0.05)",
                  borderColor: isSelected ? colors.primary : "rgba(255, 255, 255, 0.1)",
                },
              ]}
              className="active:opacity-85 shadow-sm">
              <Text
                style={{
                  color: isSelected ? colors.primary : colors.foreground,
                  fontWeight: isSelected ? "700" : "500",
                }}
                className="text-sm font-sans tracking-wide">
                {tag.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Glass>
  );
}

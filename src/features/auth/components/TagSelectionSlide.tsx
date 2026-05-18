import { Pressable, View } from "react-native";
import { Glass } from "@/components/layout/Glass";
import { Text } from "@/components/ui/text";
import { cn } from "@/lib/utils";

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
  return (
    <Glass className="h-64 w-full p-4 justify-center items-center border border-zinc-800">
      <View className="flex-row flex-wrap justify-center gap-3 w-full">
        {AVAILABLE_TAGS.map((tag) => {
          const isSelected = selectedTags.includes(tag.id);
          return (
            <Pressable
              key={tag.id}
              onPress={() => onToggleTag(tag.id)}
              className={cn(
                "py-3 px-4 rounded-lg border-[1.5px] active:opacity-85",
                isSelected ? "bg-primary/15 border-primary" : "bg-white/5 border-white/10"
              )}>
              <Text
                className={cn(
                  "text-sm font-sans tracking-wide",
                  isSelected ? "text-primary font-bold" : "text-foreground font-medium"
                )}>
                {tag.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </Glass>
  );
}

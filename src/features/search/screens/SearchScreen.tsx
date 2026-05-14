import { CompassIcon, LayersIcon, SearchIcon, UsersIcon, XIcon } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, TextInput, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Avatar } from "@/components/ui/avatar";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useColors } from "@/hooks/use-colors";

// Mock data for search
const MOCK_PROFILES = [
  {
    id: "1",
    username: "captain_wave",
    bio: "Hunting the big tides in the crypto ocean.",
    is_verified: true,
  },
  { id: "2", username: "drift_queen", bio: "Streaming live from the abyss.", is_verified: false },
];

const MOCK_WAVES = [
  { id: "101", content: "Just dropped a massive wave in the Atlantic!", author: "captain_wave" },
  { id: "102", content: "Who's ready for the midnight drift session?", author: "drift_queen" },
];

export function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<{
    profiles: typeof MOCK_PROFILES;
    waves: typeof MOCK_WAVES;
  } | null>(null);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      setIsSearching(true);
      // Simulate search delay
      setTimeout(() => {
        setResults({
          profiles: MOCK_PROFILES.filter((p) => p.username.includes(text.toLowerCase())),
          waves: MOCK_WAVES.filter((w) => w.content.toLowerCase().includes(text.toLowerCase())),
        });
        setIsSearching(false);
      }, 500);
    } else {
      setResults(null);
    }
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <View className="px-6 py-4">
        <Text variant="h1" className="mb-4 text-white">
          Hunt
        </Text>
        <Glass
          radius={24}
          intensity={20}
          className="flex-row items-center px-4 py-2 border border-white/10">
          <Icon as={SearchIcon} size={20} className="text-muted-foreground mr-3" />
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search creators, waves, bios..."
            placeholderTextColor="rgba(255,255,255,0.3)"
            className="flex-1 h-12 text-white font-medium text-base"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Pressable onPress={() => handleSearch("")}>
              <Icon as={XIcon} size={20} className="text-muted-foreground" />
            </Pressable>
          )}
        </Glass>
      </View>

      {isSearching ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : results ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
          showsVerticalScrollIndicator={false}>
          {results.profiles.length > 0 && (
            <View className="px-6 mb-8">
              <View className="flex-row items-center mb-4 gap-2">
                <Icon as={UsersIcon} size={16} className="text-primary" />
                <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Profiles
                </Text>
              </View>
              {results.profiles.map((p) => (
                <Glass key={p.id} className="p-4 mb-3 flex-row items-center border border-white/5">
                  <Avatar username={p.username} size={48} ring={p.is_verified} />
                  <View className="ml-4 flex-1">
                    <Text className="font-bold text-white text-base">
                      @{p.username} {p.is_verified && "✓"}
                    </Text>
                    <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                      {p.bio}
                    </Text>
                  </View>
                </Glass>
              ))}
            </View>
          )}

          {results.waves.length > 0 && (
            <View className="px-6">
              <View className="flex-row items-center mb-4 gap-2">
                <Icon as={LayersIcon} size={16} className="text-primary" />
                <Text className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Waves
                </Text>
              </View>
              {results.waves.map((w) => (
                <Glass key={w.id} className="p-4 mb-3 border border-white/5">
                  <View className="flex-row items-center mb-2">
                    <Avatar username={w.author} size={24} />
                    <Text className="ml-2 font-bold text-white text-xs">@{w.author}</Text>
                  </View>
                  <Text className="text-white/80 text-sm leading-5">{w.content}</Text>
                </Glass>
              ))}
            </View>
          )}

          {results.profiles.length === 0 && results.waves.length === 0 && (
            <View className="flex-1 items-center justify-center p-12 mt-12">
              <Icon as={CompassIcon} size={48} className="text-white/10 mb-4" />
              <Text className="text-muted-foreground text-center">
                No results found for "{query}"
              </Text>
            </View>
          )}
        </ScrollView>
      ) : (
        <View className="flex-1 items-center justify-center p-12">
          <Icon as={CompassIcon} size={64} className="text-white/5 mb-6" />
          <Text className="text-muted-foreground text-center text-lg">
            Start hunting for waves and creators across the XapXap ocean.
          </Text>
        </View>
      )}
    </View>
  );
}

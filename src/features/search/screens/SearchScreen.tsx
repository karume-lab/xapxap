import { useRouter } from "expo-router";
import { SearchIcon, TrendingUpIcon, XIcon } from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, FlatList, Modal, ScrollView, TextInput, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { XapXapHeader } from "@/components/layout/XapXapHeader";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { useAuth } from "@/contexts/auth-context";
import {
  incrementBuzz,
  mockPopularTags,
  mockTrendingWaves,
} from "@/features/search/mock-data/search";
import { CommentsSheet } from "@/features/waves/components/CommentsSheet";
import { useColors } from "@/hooks/use-colors";

export function SearchScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { session, showAuthModal } = useAuth();
  const [query, setQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [trendingWaves, setTrendingWaves] = useState(mockTrendingWaves);
  const [popularTags] = useState(mockPopularTags);
  const [showComments, setShowComments] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const handleSearch = (text: string) => {
    setQuery(text);
    if (text.length > 2) {
      setIsSearching(true);
      setTimeout(() => {
        setIsSearching(false);
      }, 800);
    }
  };

  const handlePressWave = (id: string) => {
    if (!session) return showAuthModal();
    incrementBuzz(id);
    setTrendingWaves([...mockTrendingWaves]);
    setSelectedPostId(id);
    setShowComments(true);
  };

  return (
    <View className="flex-1 bg-background" style={{ paddingTop: insets.top }}>
      <XapXapHeader />

      <View className="px-6 py-2">
        <View className="bg-muted rounded-full flex-row items-center px-5 h-14 border border-border">
          <Icon as={SearchIcon} size={20} className="text-muted-foreground mr-3" />
          <TextInput
            value={query}
            onChangeText={handleSearch}
            placeholder="Search waves, people, #tags..."
            placeholderTextColor={colors.mutedForeground}
            className="flex-1 h-full text-foreground font-medium text-base"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <Button
              variant="ghost"
              onPress={() => handleSearch("")}
              className="p-0 min-w-0 min-h-0 h-auto w-auto bg-transparent active:bg-transparent">
              <Icon as={XIcon} size={20} className="text-muted-foreground" />
            </Button>
          )}
        </View>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}>
        {/* Popular Tags Section */}
        <View className="mt-6">
          <View className="px-6 mb-6">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-4">
              Popular Tags
            </Text>
            <View className="flex-row flex-wrap gap-2.5">
              {popularTags.map((tag) => (
                <Button
                  key={tag.id}
                  variant="ghost"
                  onPress={() => {
                    setQuery(tag.tag);
                    setIsSearching(true);
                    setTimeout(() => setIsSearching(false), 600);
                  }}
                  className="bg-muted border border-border rounded-full active:bg-secondary p-0 min-w-0 min-h-0 h-auto w-auto">
                  <View className="flex-row items-center gap-1.5 px-4 py-2.5">
                    <Text className="text-foreground text-sm font-semibold">{tag.tag}</Text>
                    <Text className="text-muted-foreground text-[10px] font-medium">
                      • {tag.count} drops
                    </Text>
                  </View>
                </Button>
              ))}
            </View>
          </View>
        </View>

        {/* Trending Waves Section */}
        <View className="mt-4">
          <View className="px-6 mb-4">
            <Text className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
              Trending Waves
            </Text>
          </View>

          {isSearching ? (
            <View className="h-40 items-center justify-center">
              <ActivityIndicator color={colors.primary} />
            </View>
          ) : (
            <FlatList
              horizontal
              data={trendingWaves}
              keyExtractor={(item) => item.id}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              renderItem={({ item }) => (
                <Button
                  variant="ghost"
                  onPress={() => handlePressWave(item.id)}
                  className="p-0 min-w-0 min-h-0 h-auto w-auto bg-transparent active:bg-transparent">
                  <Glass radius={24} className="w-64 h-48 p-5 mr-4 border border-border bg-muted">
                    <Button
                      variant="ghost"
                      onPress={(e) => {
                        e.stopPropagation();
                        router.push({
                          pathname: "/profile/[id]",
                          params: { id: item.author, username: item.author },
                        });
                      }}
                      className="flex-row items-center mb-4 p-0 min-w-0 min-h-0 h-auto w-auto bg-transparent active:bg-transparent">
                      <Avatar username={item.author} size={32} />
                      <Text className="ml-3 font-bold text-foreground text-sm">@{item.author}</Text>
                    </Button>
                    <View className="flex-1">
                      <Text className="text-foreground/80 text-sm leading-5" numberOfLines={3}>
                        {item.content}
                      </Text>
                    </View>
                    <View className="flex-row items-center mt-2">
                      <Icon as={TrendingUpIcon} size={14} className="text-primary mr-1.5" />
                      <Text className="text-primary font-bold text-xs">{item.buzz} buzz</Text>
                    </View>
                  </Glass>
                </Button>
              )}
            />
          )}
        </View>
      </ScrollView>

      <Modal
        visible={showComments}
        animationType="none"
        transparent={true}
        onRequestClose={() => {
          setShowComments(false);
          setSelectedPostId(null);
        }}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <View className="flex-1 bg-transparent">
            <CommentsSheet
              postId={selectedPostId ? `fame-${selectedPostId}` : null}
              onClose={() => {
                setShowComments(false);
                setSelectedPostId(null);
              }}
            />
          </View>
        </GestureHandlerRootView>
      </Modal>
    </View>
  );
}

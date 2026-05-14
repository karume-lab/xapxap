import { Image } from "expo-image";
import {
  DiamondIcon,
  GlobeIcon,
  LockIcon,
  PlayIcon,
  ShieldAlertIcon,
  UsersIcon,
  VideoIcon,
  XIcon,
} from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  Switch,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/error-boundary/ErrorBoundary";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { type LiveStreamWithAuthor, useLiveStreams } from "@/features/streaming/api/queries";
import { useColors } from "@/hooks/use-colors";
import { useNetwork } from "@/hooks/use-network";

function StreamCard({ item }: { item: LiveStreamWithAuthor }) {
  const isPremium = item.quality === "aqua_premium";
  const [isUnlocked, setIsUnlocked] = useState(!item.isGated || (item.entryFeeGems || 0) === 0);

  const handleUnlock = () => {
    Alert.alert(
      "Aqua Premium Entry",
      `Unlock this high-definition stream for ${item.entryFeeGems} GEMS?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Pay & Enter",
          onPress: () => {
            setIsUnlocked(true);
            Alert.alert("Unlocked", "Enjoy the Aqua Premium experience.");
          },
        },
      ]
    );
  };

  return (
    <Glass intensity={20} className="mb-4 overflow-hidden border border-white/10" radius={24}>
      <View className="relative h-[200px] w-full">
        <Image
          source={{ uri: item.playbackUrl || undefined }}
          style={{ width: "100%", height: "100%" }}
          contentFit="cover"
        />

        {/* Status Badge */}
        <View className="absolute top-3 left-3 bg-red-600 px-2 py-1 rounded-md flex-row items-center gap-1">
          <View className="w-1.5 h-1.5 rounded-full bg-white" />
          <Text className="text-[10px] font-bold text-white">LIVE</Text>
        </View>

        {/* Quality Badge */}
        <View className="absolute top-3 right-3 bg-black/60 px-2 py-1 rounded-md border border-white/20">
          <Text
            className={`text-[10px] font-bold ${isPremium ? "text-cyan-400" : "text-[#bef445]"}`}>
            {isPremium ? "AQUA HD" : "DRIFT"}
          </Text>
        </View>

        {/* Gated Overlay */}
        {!isUnlocked && (
          <Glass intensity={90} className="absolute inset-0 items-center justify-center p-6">
            <Icon as={ShieldAlertIcon} size={32} className="text-cyan-400 mb-2" />
            <Text variant="h3" className="text-center mb-1">
              Aqua Premium
            </Text>
            <Text className="text-xs text-muted-foreground text-center mb-4">
              HD Streaming • Gated Access
            </Text>
            <Button onPress={handleUnlock} className="bg-cyan-500 rounded-full px-6">
              <View className="flex-row items-center gap-2">
                <Text className="font-bold">Unlock for {item.entryFeeGems}</Text>
                <Icon as={DiamondIcon} size={14} className="text-white" />
              </View>
            </Button>
          </Glass>
        )}

        {isUnlocked && (
          <View className="absolute inset-0 items-center justify-center">
            <Pressable className="bg-[#bef445] h-14 w-14 rounded-full items-center justify-center shadow-lg">
              <Icon as={PlayIcon} className="text-black ml-1" size={28} />
            </Pressable>
          </View>
        )}
      </View>

      <View className="p-4 flex-row items-center gap-3">
        <Avatar
          url={item.author.avatarUrl}
          username={item.author.username}
          size={40}
          ring={isPremium}
        />
        <View className="flex-1">
          <Text className="font-bold text-white" numberOfLines={1}>
            {item.title}
          </Text>
          <Text className="text-[10px] text-muted-foreground">
            @{item.author.username} • {item.viewerCount} watching
          </Text>
        </View>
      </View>
    </Glass>
  );
}

export function StreamingHubScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const { isOnline } = useNetwork();
  const { data: streams, isLoading } = useLiveStreams();

  const [createVisible, setCreateVisible] = useState(false);
  const [streamTitle, setStreamTitle] = useState("");
  const [streamKind, setStreamKind] = useState<"drift" | "aqua">("drift");
  const [tokenCost, setTokenCost] = useState("0");
  const [inviteOnly, setInviteOnly] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const handleStartStream = () => {
    if (!streamTitle.trim()) return;
    setIsStarting(true);
    setTimeout(() => {
      setIsStarting(false);
      setCreateVisible(false);
      Alert.alert("🎥 You're Live!", "Your stream is now active on the XapXap ocean.");
    }, 1500);
  };

  if (!isOnline) {
    return (
      <View className="flex-1 items-center justify-center p-6 bg-background">
        <Glass className="p-6 items-center">
          <Text variant="h3" className="mb-2">
            Offline Hub
          </Text>
          <Text className="text-muted-foreground text-center">
            Live streams require a data signal. Syncing local mesh broadcasts…
          </Text>
        </Glass>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <View className="flex-1 bg-background">
        <View
          style={{ paddingTop: insets.top + 10 }}
          className="px-6 pb-4 flex-row items-center justify-between">
          <View>
            <Text variant="h2" className="text-[#bef445]">
              Stream Hub
            </Text>
            <Text className="text-xs text-muted-foreground">Drift & Aqua HD Channels</Text>
          </View>
          <Pressable
            onPress={() => setCreateVisible(true)}
            className="w-12 h-12 rounded-full bg-primary/10 items-center justify-center border border-primary/20">
            <Icon as={VideoIcon} className="text-[#bef445]" size={24} />
          </Pressable>
        </View>

        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color="#bef445" />
          </View>
        ) : (
          <FlatList
            data={streams}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingHorizontal: 20,
              paddingVertical: 20,
              paddingBottom: 140,
            }}
            renderItem={({ item }) => <StreamCard item={item} />}
            ListEmptyComponent={
              <View className="p-10 items-center">
                <Text className="text-muted-foreground">No streams active right now.</Text>
              </View>
            }
          />
        )}

        {/* Go Live Modal */}
        <Modal
          visible={createVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCreateVisible(false)}>
          <View className="flex-1 justify-end bg-black/60">
            <Glass
              intensity={95}
              className="rounded-t-[40px] p-8 border-t border-white/20"
              style={{ paddingBottom: insets.bottom + 40 }}>
              <View className="flex-row justify-between items-center mb-8">
                <View>
                  <Text variant="h2" className="text-white">
                    Go Live
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    Broadcast to the global tide
                  </Text>
                </View>
                <Pressable
                  onPress={() => setCreateVisible(false)}
                  className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                  <Icon as={XIcon} className="text-white" size={20} />
                </Pressable>
              </View>

              <View className="gap-6">
                <View>
                  <Text className="text-[10px] font-bold uppercase text-muted-foreground mb-2 ml-1 tracking-widest">
                    Stream Title
                  </Text>
                  <TextInput
                    value={streamTitle}
                    onChangeText={setStreamTitle}
                    placeholder="What's happening?"
                    placeholderTextColor="rgba(255,255,255,0.3)"
                    className="h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white font-medium"
                    maxLength={80}
                  />
                </View>

                <View>
                  <Text className="text-[10px] font-bold uppercase text-muted-foreground mb-3 ml-1 tracking-widest">
                    Select Quality
                  </Text>
                  <View className="flex-row gap-3">
                    <Pressable
                      onPress={() => setStreamKind("drift")}
                      className={`flex-1 p-4 rounded-2xl border flex-row items-center gap-2 ${streamKind === "drift" ? "bg-[#bef445]/20 border-[#bef445]" : "bg-white/5 border-white/10"}`}>
                      <Icon
                        as={GlobeIcon}
                        size={16}
                        className={
                          streamKind === "drift" ? "text-[#bef445]" : "text-muted-foreground"
                        }
                      />
                      <Text
                        className={`font-bold ${streamKind === "drift" ? "text-[#bef445]" : "text-muted-foreground"}`}>
                        Drift (Free)
                      </Text>
                    </Pressable>
                    <Pressable
                      onPress={() => setStreamKind("aqua")}
                      className={`flex-1 p-4 rounded-2xl border flex-row items-center gap-2 ${streamKind === "aqua" ? "bg-cyan-500/20 border-cyan-500" : "bg-white/5 border-white/10"}`}>
                      <Icon
                        as={LockIcon}
                        size={16}
                        className={
                          streamKind === "aqua" ? "text-cyan-400" : "text-muted-foreground"
                        }
                      />
                      <Text
                        className={`font-bold ${streamKind === "aqua" ? "text-cyan-400" : "text-muted-foreground"}`}>
                        Aqua HD
                      </Text>
                    </Pressable>
                  </View>
                </View>

                {streamKind === "aqua" && (
                  <View>
                    <Text className="text-[10px] font-bold uppercase text-muted-foreground mb-2 ml-1 tracking-widest">
                      Entry Fee (Gems)
                    </Text>
                    <TextInput
                      value={tokenCost}
                      onChangeText={setTokenCost}
                      placeholder="e.g. 50"
                      placeholderTextColor="rgba(255,255,255,0.3)"
                      className="h-14 bg-white/5 border border-white/10 rounded-2xl px-4 text-white font-medium"
                      keyboardType="numeric"
                    />
                  </View>
                )}

                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center gap-3">
                    <Icon as={UsersIcon} size={18} className="text-muted-foreground" />
                    <Text className="text-white font-bold">Invite Only</Text>
                  </View>
                  <Switch
                    value={inviteOnly}
                    onValueChange={setInviteOnly}
                    trackColor={{ true: colors.primary, false: "rgba(255,255,255,0.1)" }}
                    thumbColor="#fff"
                  />
                </View>

                <Button
                  onPress={handleStartStream}
                  isLoading={isStarting}
                  disabled={!streamTitle.trim()}
                  className="h-16 rounded-2xl bg-red-600 mt-2">
                  <View className="flex-row items-center gap-2">
                    <Icon as={VideoIcon} size={20} className="text-white" />
                    <Text className="text-white font-bold text-lg">Start Broadcast</Text>
                  </View>
                </Button>
              </View>
            </Glass>
          </View>
        </Modal>
      </View>
    </ErrorBoundary>
  );
}

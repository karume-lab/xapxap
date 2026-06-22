import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  Diamond,
  GlobeIcon,
  Lock,
  PlayIcon,
  PlusIcon,
  ShieldAlertIcon,
  Users,
  VideoIcon,
  X,
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
import { Glass } from "@/components/layout/Glass";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Text } from "@/components/ui/text";
import { type LiveStreamWithAuthor, useLiveStreams } from "@/features/streaming/api/queries";
import { useColors } from "@/hooks/use-colors";
import { useNetwork } from "@/hooks/use-network";
import { cn } from "@/lib/utils";

function StreamCard({ item, onPress }: { item: LiveStreamWithAuthor; onPress: () => void }) {
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
    <Pressable
      onPress={() => {
        if (isUnlocked) onPress();
      }}>
      <Glass intensity={20} className="mb-4 overflow-hidden border border-border" radius={24}>
        <View className="relative h-50 w-full">
          <Image
            source={{ uri: item.playbackUrl || undefined }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />

          {/* Status Badge */}
          <View className="absolute top-3 left-3 bg-destructive px-2 py-1 rounded-md flex-row items-center gap-1">
            <View className="w-1.5 h-1.5 rounded-full bg-destructive-foreground" />
            <Text className="text-[10px] font-bold text-destructive-foreground">LIVE</Text>
          </View>

          {/* Quality Badge */}
          <View className="absolute top-3 right-3 bg-background/60 px-2 py-1 rounded-md border border-border">
            <Text className={cn("text-[10px] font-bold", isPremium ? "text-cyan" : "text-primary")}>
              {isPremium ? "AQUA HD" : "DRIFT"}
            </Text>
          </View>

          {/* Gated Overlay */}
          {!isUnlocked && (
            <Glass intensity={90} className="absolute inset-0 items-center justify-center p-6">
              <Icon as={ShieldAlertIcon} size={32} className="text-cyan mb-2" />
              <Text variant="h3" className="text-center mb-1">
                Aqua Premium
              </Text>
              <Text className="text-xs text-muted-foreground text-center mb-4">
                HD Streaming • Gated Access
              </Text>
              <Button onPress={handleUnlock} className="bg-cyan rounded-full px-6">
                <View className="flex-row items-center gap-2">
                  <Text className="font-bold text-primary-foreground">
                    Unlock for {item.entryFeeGems}
                  </Text>
                  <Icon as={Diamond} size={14} className="text-primary-foreground" />
                </View>
              </Button>
            </Glass>
          )}

          {isUnlocked && (
            <View className="absolute inset-0 items-center justify-center" pointerEvents="none">
              <View className="bg-black/40 h-14 w-14 rounded-full items-center justify-center shadow-lg backdrop-blur-md border border-white/10">
                <Icon as={PlayIcon} className="text-white ml-1" size={28} />
              </View>
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
            <Text className="font-bold text-foreground" numberOfLines={1}>
              {item.title}
            </Text>
            <Text className="text-[10px] text-muted-foreground">
              @{item.author.username} • {item.viewerCount} watching
            </Text>
          </View>
        </View>
      </Glass>
    </Pressable>
  );
}

export function StreamingHubScreen() {
  const insets = useSafeAreaInsets();
  const colors = useColors();
  const router = useRouter();
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

  const renderHeader = () => (
    <View className="px-6 pt-4 pb-2">
      <View className="mb-6">
        <Text className="text-3xl font-bold text-foreground tracking-tight">Live & Fame...</Text>
        <Text className="text-muted-foreground text-sm font-medium mt-1">
          Stream live or boost your waves
        </Text>
      </View>

      <LinearGradient
        colors={[`${colors.primary}20`, `${colors.primary}10`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          borderRadius: 28,
          padding: 24,
          marginBottom: 32,
          borderWidth: 1,
          borderColor: `${colors.primary}30`,
        }}>
        <View className="flex-row items-center gap-4 mb-4">
          <View className="w-14 h-14 rounded-full bg-destructive/10 border border-destructive/20 items-center justify-center">
            <Icon as={VideoIcon} className="text-destructive" size={24} />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-foreground">Go Live</Text>
            <Text className="text-muted-foreground text-xs mt-0.5">
              Broadcast to your crew in real time
            </Text>
          </View>
        </View>

        <Text className="text-foreground/80 text-sm mb-6 leading-5">
          Free lives grow your crew. Ticketed lives let you earn gems from your audience.
        </Text>

        <Button
          onPress={() => setCreateVisible(true)}
          className="rounded-full bg-background/50 border border-border h-12 flex-row items-center justify-center">
          <View className="w-2 h-2 rounded-full bg-destructive mr-2" />
          <Text className="text-foreground font-bold">Start Broadcasting</Text>
        </Button>
      </LinearGradient>

      <Text className="text-xs font-bold text-muted-foreground uppercase tracking-[0.15em] mb-4">
        LIVE NOW
      </Text>
    </View>
  );

  return (
    <ErrorBoundary>
      <View className="flex-1 bg-background">
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={colors.primary} />
          </View>
        ) : (
          <FlatList
            data={streams}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{
              paddingTop: insets.top,
              paddingBottom: 140,
            }}
            ListHeaderComponent={renderHeader}
            renderItem={({ item }) => (
              <View className="px-6">
                <StreamCard item={item} onPress={() => router.push(`/stream/${item.id}`)} />
              </View>
            )}
            ListEmptyComponent={
              <View className="p-10 items-center">
                <Text className="text-muted-foreground">No streams active right now.</Text>
              </View>
            }
          />
        )}

        {/* Drop a Wave FAB */}
        <View className="absolute right-6" style={{ bottom: insets.bottom + 100 }}>
          <Button
            onPress={() => router.push("/create-post")}
            className="w-14 h-14 rounded-full bg-primary items-center justify-center shadow-lg shadow-primary/30 p-0 active:bg-primary/90">
            <Icon as={PlusIcon} size={28} className="text-primary-foreground" />
          </Button>
        </View>

        {/* Go Live Modal */}
        <Modal
          visible={createVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCreateVisible(false)}>
          <View className="flex-1 justify-end bg-background/60">
            <Glass
              intensity={95}
              className="rounded-t-[40px] p-8 border-t border-border"
              style={{ paddingBottom: insets.bottom + 40 }}>
              <View className="flex-row justify-between items-center mb-8">
                <View>
                  <Text variant="h2" className="text-foreground">
                    Go Live
                  </Text>
                  <Text className="text-muted-foreground text-sm">
                    Broadcast to the global tide
                  </Text>
                </View>
                <Button
                  variant="ghost"
                  onPress={() => setCreateVisible(false)}
                  className="w-10 h-10 rounded-full bg-muted items-center justify-center p-0 min-w-0 min-h-0 active:bg-transparent">
                  <Icon as={X} className="text-foreground" size={20} />
                </Button>
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
                    placeholderTextColor={colors.mutedForeground}
                    className="h-14 bg-muted border border-border rounded-2xl px-4 text-foreground font-medium"
                    maxLength={80}
                  />
                </View>

                <View>
                  <Text className="text-[10px] font-bold uppercase text-muted-foreground mb-3 ml-1 tracking-widest">
                    Select Quality
                  </Text>
                  <View className="flex-row gap-3">
                    <Button
                      variant="ghost"
                      onPress={() => setStreamKind("drift")}
                      className={cn(
                        "flex-1 rounded-2xl border flex-row items-center gap-2 p-0 min-w-0 min-h-0 h-auto w-auto active:bg-transparent bg-transparent",
                        streamKind === "drift"
                          ? "bg-primary/20 border-primary"
                          : "bg-muted border-border"
                      )}>
                      <View className="flex-row items-center gap-2 p-4">
                        <Icon
                          as={GlobeIcon}
                          size={16}
                          className={
                            streamKind === "drift" ? "text-primary" : "text-muted-foreground"
                          }
                        />
                        <Text
                          className={cn(
                            "font-bold",
                            streamKind === "drift" ? "text-primary" : "text-muted-foreground"
                          )}>
                          Drift (Free)
                        </Text>
                      </View>
                    </Button>
                    <Button
                      variant="ghost"
                      onPress={() => setStreamKind("aqua")}
                      className={cn(
                        "flex-1 rounded-2xl border flex-row items-center gap-2 p-0 min-w-0 min-h-0 h-auto w-auto active:bg-transparent bg-transparent",
                        streamKind === "aqua" ? "bg-cyan/20 border-cyan" : "bg-muted border-border"
                      )}>
                      <View className="flex-row items-center gap-2 p-4">
                        <Icon
                          as={Lock}
                          size={16}
                          className={streamKind === "aqua" ? "text-cyan" : "text-muted-foreground"}
                        />
                        <Text
                          className={cn(
                            "font-bold",
                            streamKind === "aqua" ? "text-cyan" : "text-muted-foreground"
                          )}>
                          Aqua HD
                        </Text>
                      </View>
                    </Button>
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
                      placeholderTextColor={colors.mutedForeground}
                      className="h-14 bg-muted border border-border rounded-2xl px-4 text-foreground font-medium"
                      keyboardType="numeric"
                    />
                  </View>
                )}

                <View className="flex-row items-center justify-between py-2">
                  <View className="flex-row items-center gap-3">
                    <Icon as={Users} size={18} className="text-muted-foreground" />
                    <Text className="text-foreground font-bold">Invite Only</Text>
                  </View>
                  <Switch
                    value={inviteOnly}
                    onValueChange={setInviteOnly}
                    trackColor={{ true: colors.primary, false: colors.muted }}
                    thumbColor={colors.foreground}
                  />
                </View>

                <Button
                  onPress={handleStartStream}
                  isLoading={isStarting}
                  disabled={!streamTitle.trim()}
                  className="h-16 rounded-2xl bg-destructive mt-2">
                  <View className="flex-row items-center gap-2">
                    <Icon as={VideoIcon} size={20} className="text-destructive-foreground" />
                    <Text className="text-destructive-foreground font-bold text-lg">
                      Start Broadcast
                    </Text>
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

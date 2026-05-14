import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { AlertCircleIcon, CheckCircleIcon, LogOutIcon } from "lucide-react-native";
import { useMemo, useRef, useState } from "react";
import { Alert, Pressable, Text, TextInput, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { Button } from "@/components/ui/button";
import { Glass } from "@/components/ui/glass";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/contexts/auth-context";
import { useColors } from "@/hooks/use-colors";

const MIN_AGE = 18;

function ageFromDate(d: Date): number {
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age -= 1;
  return age;
}

export function AgeVerifyScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { height } = useWindowDimensions();
  const { updateProfile, signOut } = useAuth();
  const [day, setDay] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [busy, setBusy] = useState(false);

  const monthRef = useRef<TextInput>(null);
  const yearRef = useRef<TextInput>(null);

  const compact = height < 700;

  const dob = useMemo(() => {
    const d = parseInt(day, 10);
    const m = parseInt(month, 10);
    const y = parseInt(year, 10);
    if (!d || !m || !y || y < 1900 || y > new Date().getFullYear()) return null;
    if (m < 1 || m > 12 || d < 1 || d > 31) return null;
    const date = new Date(Date.UTC(y, m - 1, d));
    if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m - 1 || date.getUTCDate() !== d) {
      return null;
    }
    return date;
  }, [day, month, year]);

  const age = dob ? ageFromDate(dob) : null;
  const tooYoung = age !== null && age < MIN_AGE;

  const submit = async () => {
    if (!dob) {
      Alert.alert("Date of birth", "Enter a valid date.");
      return;
    }
    if (tooYoung) {
      Alert.alert("Sorry", `You must be ${MIN_AGE} or older to use XapXap.`);
      return;
    }
    setBusy(true);
    try {
      await updateProfile({ dateOfBirth: dob });
      router.replace("/(tabs)");
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Could not save";
      Alert.alert("Age verify", msg);
    } finally {
      setBusy(false);
    }
  };

  return (
    <View className="flex-1" style={{ backgroundColor: colors.background }}>
      <LinearGradient
        colors={["#2A0A2A", "transparent"]}
        className="absolute top-0 left-0 right-0 h-[360px] opacity-70"
      />
      <KeyboardAwareScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: height * 0.22 + insets.top,
          paddingBottom: insets.bottom + (compact ? 40 : 60),
        }}
        bottomOffset={20}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Pressable
          style={{
            position: "absolute",
            top: insets.top + 10,
            right: 20,
            zIndex: 10,
          }}
          onPress={() => signOut()}>
          <Icon as={LogOutIcon} className="text-muted-foreground" size={20} />
        </Pressable>

        <View className="w-full max-w-[460px] self-center gap-6">
          <View>
            <Text className="text-foreground font-bold text-3xl tracking-tight font-[Inter_700Bold]">
              Quick check
            </Text>
            <Text className="text-muted-foreground mt-2 text-sm font-[Inter_400Regular]">
              We need your date of birth to keep XapXap a safe space. You must be at least {MIN_AGE}{" "}
              years old.
            </Text>
          </View>

          <View className="flex-row gap-3">
            <View className="flex-1">
              <Text className="text-muted-foreground font-medium text-[11px] tracking-widest uppercase mb-2 ml-1">
                Day
              </Text>
              <Glass radius={20}>
                <TextInput
                  value={day}
                  onChangeText={(t) => {
                    const clean = t.replace(/\D/g, "").slice(0, 2);
                    setDay(clean);
                    if (clean.length === 2) monthRef.current?.focus();
                  }}
                  placeholder="DD"
                  placeholderTextColor={colors.mutedForeground}
                  className="text-foreground font-semibold text-2xl py-4 px-0"
                  style={{
                    textAlign: "center",
                    textAlignVertical: "center",
                    width: "100%",
                    paddingHorizontal: 0,
                    includeFontPadding: false,
                  }}
                  keyboardType="number-pad"
                  selectionColor={colors.primary}
                  maxLength={2}
                  returnKeyType="next"
                  onSubmitEditing={() => monthRef.current?.focus()}
                />
              </Glass>
            </View>
            <View className="flex-1">
              <Text className="text-muted-foreground font-medium text-[11px] tracking-widest uppercase mb-2 ml-1">
                Month
              </Text>
              <Glass radius={20}>
                <TextInput
                  ref={monthRef}
                  value={month}
                  onChangeText={(t) => {
                    const clean = t.replace(/\D/g, "").slice(0, 2);
                    setMonth(clean);
                    if (clean.length === 2) yearRef.current?.focus();
                  }}
                  placeholder="MM"
                  placeholderTextColor={colors.mutedForeground}
                  className="text-foreground font-semibold text-2xl py-4 px-0"
                  style={{
                    textAlign: "center",
                    textAlignVertical: "center",
                    width: "100%",
                    paddingHorizontal: 0,
                    includeFontPadding: false,
                  }}
                  keyboardType="number-pad"
                  selectionColor={colors.primary}
                  maxLength={2}
                  returnKeyType="next"
                  onSubmitEditing={() => yearRef.current?.focus()}
                />
              </Glass>
            </View>
            <View className="flex-[1.3]">
              <Text className="text-muted-foreground font-medium text-[11px] tracking-widest uppercase mb-2 ml-1">
                Year
              </Text>
              <Glass radius={20}>
                <TextInput
                  ref={yearRef}
                  value={year}
                  onChangeText={(t) => setYear(t.replace(/\D/g, "").slice(0, 4))}
                  placeholder="YYYY"
                  placeholderTextColor={colors.mutedForeground}
                  className="text-foreground font-semibold text-2xl py-4 px-0"
                  style={{
                    textAlign: "center",
                    textAlignVertical: "center",
                    width: "100%",
                    paddingHorizontal: 0,
                    includeFontPadding: false,
                  }}
                  keyboardType="number-pad"
                  selectionColor={colors.primary}
                  maxLength={4}
                  returnKeyType="done"
                  onSubmitEditing={submit}
                />
              </Glass>
            </View>
          </View>

          {age !== null ? (
            <View
              className="flex-row items-center gap-3 p-4 border border-border rounded-2xl"
              style={{
                backgroundColor: tooYoung ? "rgba(255,95,168,0.10)" : "rgba(108,231,255,0.08)",
              }}>
              <Icon
                as={tooYoung ? AlertCircleIcon : CheckCircleIcon}
                className={tooYoung ? "text-magenta" : "text-accent"}
                size={18}
              />
              <Text className="flex-1 text-foreground font-normal text-sm leading-5 font-[Inter_400Regular]">
                {tooYoung
                  ? `Sorry, XapXap is only for ages ${MIN_AGE}+.`
                  : `You're ${age} — welcome aboard.`}
              </Text>
            </View>
          ) : null}

          <Button
            onPress={submit}
            size="lg"
            isLoading={busy}
            disabled={!dob || tooYoung}
            className="h-14 rounded-[26px]">
            <View className="flex-row items-center gap-2">
              <Text
                className="font-bold text-lg text-primary-foreground"
                numberOfLines={1}
                adjustsFontSizeToFit>
                Continue
              </Text>
            </View>
          </Button>
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

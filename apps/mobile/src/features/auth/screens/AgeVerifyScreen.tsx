import DateTimePicker from "@react-native-community/datetimepicker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Calendar, CircleAlert, CircleCheck, LogOut } from "lucide-react-native";
import { useState } from "react";
import { Alert, Platform, Pressable, Text, useWindowDimensions, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Glass } from "@/components/layout/Glass";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { useAuth } from "@/contexts/auth-context";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

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

  const [dob, setDob] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [busy, setBusy] = useState(false);

  const compact = height < 700;

  const age = dob ? ageFromDate(dob) : null;
  const tooYoung = age !== null && age < MIN_AGE;

  const handleDateChange = (_event: unknown, selectedDate?: Date) => {
    if (Platform.OS === "android") {
      setShowPicker(false);
    }
    if (selectedDate) {
      setDob(selectedDate);
    }
  };

  const handleDismiss = () => {
    setShowPicker(false);
  };

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
        colors={[colors.muted, "transparent"]}
        className="absolute top-0 left-0 right-0 h-90 opacity-70"
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
        <Button
          variant="ghost"
          style={{
            position: "absolute",
            top: insets.top + 10,
            right: 20,
            zIndex: 10,
          }}
          onPress={() => signOut()}
          className="p-0 min-w-0 min-h-0 bg-transparent active:bg-transparent">
          <Icon as={LogOut} className="text-muted-foreground" size={20} />
        </Button>

        <View className="w-full max-w-115 self-center gap-6">
          <View>
            <Text className="text-foreground font-bold text-3xl tracking-tight font-[Inter_700Bold]">
              Quick check
            </Text>
            <Text className="text-muted-foreground mt-2 text-sm font-[Inter_400Regular]">
              We need your date of birth to keep XapXap a safe space. You must be at least {MIN_AGE}{" "}
              years old.
            </Text>
          </View>

          <View>
            <Text className="text-muted-foreground font-medium text-[11px] tracking-widest uppercase mb-2 ml-1">
              Date of Birth
            </Text>
            <Pressable onPress={() => setShowPicker(true)}>
              <Glass radius={20} className="flex-row items-center justify-between p-4 px-6 h-16">
                <Text
                  className={cn(
                    "text-xl font-semibold",
                    dob ? "text-foreground" : "text-muted-foreground"
                  )}>
                  {dob ? dob.toLocaleDateString() : "Select your date of birth"}
                </Text>
                <Icon as={Calendar} size={24} className="text-primary" />
              </Glass>
            </Pressable>

            {showPicker && (
              <DateTimePicker
                value={dob || new Date(new Date().setFullYear(new Date().getFullYear() - 18))}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onValueChange={handleDateChange}
                onDismiss={handleDismiss}
                maximumDate={new Date()}
                themeVariant="dark"
                textColor={colors.foreground}
                accentColor={colors.primary}
              />
            )}
          </View>

          {age !== null ? (
            <View
              className={cn(
                "flex-row items-center gap-3 p-4 border border-border rounded-2xl",
                tooYoung ? "bg-magenta/10" : "bg-cyan/10"
              )}>
              <Icon
                as={tooYoung ? CircleAlert : CircleCheck}
                className={tooYoung ? "text-magenta" : "text-cyan"}
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

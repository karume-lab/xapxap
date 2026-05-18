import { BlurView } from "expo-blur";
import { Platform, StyleSheet, View, type ViewProps } from "react-native";
import { useColors } from "@/hooks/use-colors";
import { cn } from "@/lib/utils";

interface GlassProps extends ViewProps {
  intensity?: number;
  tint?: "dark" | "light" | "default";
  radius?: number;
  bordered?: boolean;
  glow?: "lime" | "cyan" | "magenta" | null;
  className?: string;
}

/**
 * Glass surface — the foundational visual element of XapXap.
 * Renders a frosted blur on iOS with a hairline highlight.
 */
export function Glass({
  intensity = 40,
  tint = "dark",
  radius,
  bordered = true,
  glow = null,
  className,
  style,
  children,
  ...rest
}: GlassProps) {
  const colors = useColors();
  const r = radius ?? colors.radius;

  return (
    <View
      className={cn(
        "overflow-hidden",
        Platform.OS === "ios" ? "bg-transparent" : "bg-[rgba(255,255,255,0.05)]",
        bordered ? "border-[0.5px] border-border" : "border-0",
        glow === "lime" && "shadow-primary shadow-[0_0_20px_0_rgba(190,244,69,0.25)]",
        glow === "cyan" && "shadow-accent shadow-[0_0_20px_0_rgba(0,255,255,0.25)]",
        glow === "magenta" && "shadow-[#FF5FA8] shadow-[0_0_20px_0_rgba(255,95,168,0.25)]",
        className
      )}
      style={[{ borderRadius: r }, style]}
      {...rest}>
      {Platform.OS === "ios" ? (
        <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      ) : null}
      {/* Background Overlay */}
      <View
        style={StyleSheet.absoluteFill}
        className={
          Platform.OS === "ios" ? "bg-[rgba(255,255,255,0.03)]" : "bg-[rgba(20,20,30,0.55)]"
        }
      />
      {children}
    </View>
  );
}

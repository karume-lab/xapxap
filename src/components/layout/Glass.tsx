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
        Platform.OS === "ios" ? "bg-transparent" : "bg-muted",
        bordered ? "border-[0.5px] border-border" : "border-0",
        glow === "lime" && "shadow-primary/25 shadow-lg",
        glow === "cyan" && "shadow-accent/25 shadow-lg",
        glow === "magenta" && "shadow-magenta/25 shadow-lg",
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
        className={Platform.OS === "ios" ? "bg-muted/50" : "bg-background/55"}
      />
      {children}
    </View>
  );
}

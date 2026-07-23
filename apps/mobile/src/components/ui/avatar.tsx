import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '@/hooks/use-colors';

interface AvatarProps {
  url?: string | null;
  username?: string | null;
  size?: number;
  ring?: boolean;
}

export function Avatar({ url, username, size = 40, ring = false }: AvatarProps) {
  const colors = useColors();
  const initial = (username ?? '?').trim().charAt(0).toUpperCase();

  const containerStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
    overflow: 'hidden' as const,
    backgroundColor: colors.muted,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    borderWidth: ring ? 1.5 : StyleSheet.hairlineWidth,
    borderColor: ring ? colors.primary : colors.border,
  };

  if (url) {
    return (
      <View style={containerStyle}>
        <Image source={{ uri: url }} className="w-full h-full" contentFit="cover" />
      </View>
    );
  }

  return (
    <View style={containerStyle}>
      <Text 
        className="text-foreground font-semibold" 
        style={{ fontSize: size * 0.4, fontFamily: 'Inter_600SemiBold' }}>
        {initial}
      </Text>
    </View>
  );
}

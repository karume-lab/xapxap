import * as Haptics from 'expo-haptics';
import { BookmarkIcon, HeartIcon, RepeatIcon, SendIcon, ZapIcon, type LucideIcon } from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { Glass } from '@/components/ui/glass';
import { Avatar } from '@/components/ui/avatar';
import { useColors } from '@/hooks/use-colors';
import { useAuth } from '@/contexts/auth-context';

interface WaveCardProps {
  post: {
    id: string;
    content: string | null;
    createdAt: string;
    author: {
      id: string;
      username: string;
      avatarUrl: string | null;
      isPremium: boolean;
    };
    counts: {
      hugs: number;
      echoes: number;
      casts: number;
      anchors: number;
    };
    myInteractions: {
      hug: boolean;
      echo: boolean;
      cast: boolean;
      anchor: boolean;
    };
  };
}

export function WaveCard({ post }: WaveCardProps) {
  const colors = useColors();
  const { user } = useAuth();
  const [local, setLocal] = useState(post);

  const toggle = useCallback((type: 'hug' | 'echo' | 'cast' | 'anchor') => {
    // Mock toggle for UI demonstration
    const isOn = local.myInteractions[type];
    const key = type === 'hug' ? 'hugs' : type === 'echo' ? 'echoes' : type === 'cast' ? 'casts' : 'anchors';
    
    setLocal(prev => ({
      ...prev,
      myInteractions: { ...prev.myInteractions, [type]: !isOn },
      counts: { ...prev.counts, [key]: prev.counts[key] + (isOn ? -1 : 1) }
    }));

    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  }, [local]);

  const isOwn = local.author.id === user?.id;

  return (
    <Glass className="mx-4 mb-4 overflow-hidden">
      <View className="p-4">
        <View className="flex-row items-center gap-3">
          <Avatar 
            url={local.author.avatarUrl} 
            username={local.author.username} 
            size={40} 
            ring={local.author.isPremium} 
          />
          <View className="flex-1">
            <View className="flex-row items-center gap-1">
              <Text className="text-foreground font-semibold text-[15px] font-[Inter_600SemiBold]">
                @{local.author.username}
              </Text>
              {local.author.isPremium && <ZapIcon size={12} color={colors.primary} fill={colors.primary} />}
            </View>
            <Text className="text-muted-foreground text-xs mt-0.5 font-[Inter_400Regular]">
              {new Date(local.createdAt).toLocaleDateString()}
            </Text>
          </View>
          {!isOwn && (
            <Pressable className="bg-primary/10 border border-primary/30 flex-row items-center gap-1 py-1.5 px-3 rounded-full">
              <ZapIcon size={12} color={colors.primary} />
              <Text className="text-primary font-semibold text-xs font-[Inter_600SemiBold]">Gift</Text>
            </Pressable>
          )}
        </View>

        {local.content && (
          <Text className="text-foreground text-[15px] leading-6 mt-3 font-[Inter_400Regular]">
            {local.content}
          </Text>
        )}

        <View className="flex-row items-center justify-between mt-4">
          <InteractionButton 
            icon={HeartIcon} 
            count={local.counts.hugs} 
            active={local.myInteractions.hug} 
            color="magenta" 
            onPress={() => toggle('hug')} 
          />
          <InteractionButton 
            icon={RepeatIcon} 
            count={local.counts.echoes} 
            active={local.myInteractions.echo} 
            color="cyan" 
            onPress={() => toggle('echo')} 
          />
          <InteractionButton 
            icon={SendIcon} 
            count={local.counts.casts} 
            active={local.myInteractions.cast} 
            color="lime" 
            onPress={() => toggle('cast')} 
          />
          <InteractionButton 
            icon={BookmarkIcon} 
            count={local.counts.anchors} 
            active={local.myInteractions.anchor} 
            color="amber" 
            onPress={() => toggle('anchor')} 
          />
        </View>
      </View>
    </Glass>
  );
}

interface InteractionButtonProps {
  icon: LucideIcon;
  count: number;
  active: boolean;
  color: 'magenta' | 'cyan' | 'lime' | 'amber';
  onPress: () => void;
}

function InteractionButton({ icon: Icon, count, active, color, onPress }: InteractionButtonProps) {
  const colors = useColors();
  
  const tint = 
    color === 'lime' ? colors.primary : 
    color === 'cyan' ? colors.accent : 
    color === 'magenta' ? '#FF5FA8' : 
    '#FFC23D';

  return (
    <Pressable 
      onPress={onPress}
      className="flex-row items-center gap-1.5 py-1.5 px-2 rounded-full"
      style={{ backgroundColor: active ? `${tint}22` : 'transparent' }}>
      <Icon 
        size={18} 
        color={active ? tint : colors.mutedForeground} 
        fill={active && color === 'magenta' ? tint : 'transparent'} 
      />
      <Text 
        className="font-medium text-xs" 
        style={{ color: active ? tint : colors.mutedForeground, fontFamily: 'Inter_500Medium' }}>
        {count || ''}
      </Text>
    </Pressable>
  );
}

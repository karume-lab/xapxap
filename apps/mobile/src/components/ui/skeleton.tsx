import * as React from 'react';
import { Animated } from 'react-native';
import { cn } from '@/lib/utils';

export function Skeleton({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Animated.View>) {
  const fadeAnim = React.useRef(new Animated.Value(0.5)).current;

  React.useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0.5,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [fadeAnim]);

  return (
    <Animated.View
      style={{ opacity: fadeAnim }}
      className={cn('rounded-md bg-muted', className)}
      {...props}
    />
  );
}

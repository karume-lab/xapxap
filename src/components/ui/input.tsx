import { Pressable, TextInput, type TextInputProps, View } from 'react-native';
import { EyeIcon, EyeOffIcon } from 'lucide-react-native';
import { Glass } from '@/components/layout/Glass';
import { useColors } from '@/hooks/use-colors';
import React, { useState } from 'react';

interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
}

export const Input = React.forwardRef<TextInput, InputProps>(
  ({ icon, style, ...props }, ref) => {
    const colors = useColors();

    const [showPassword, setShowPassword] = useState(false);
    const isPassword = props.secureTextEntry;

    return (
      <Glass radius={26}>
        <View className="flex-row items-center gap-3 px-4 h-[54px]">
          {icon}
          <TextInput
            ref={ref}
            placeholderTextColor={colors.mutedForeground}
            className="flex-1 text-foreground font-medium text-[15px] p-0"
            {...props}
            secureTextEntry={isPassword && !showPassword}
          />
          {isPassword && (
            <Pressable 
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={10}
              className="p-1"
            >
              {showPassword ? (
                <EyeOffIcon size={20} color={colors.mutedForeground} />
              ) : (
                <EyeIcon size={20} color={colors.mutedForeground} />
              )}
            </Pressable>
          )}
        </View>
      </Glass>
    );
  }
);

Input.displayName = 'Input';

import { TextInput, type TextInputProps, View } from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Glass } from '@/components/layout/Glass';
import { Button } from '@/components/ui/button';
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
            <Button 
              variant="ghost"
              onPress={() => setShowPassword(!showPassword)}
              hitSlop={10}
              className="p-1 min-w-0 min-h-0 h-auto w-auto bg-transparent active:bg-transparent"
            >
              {showPassword ? (
                <EyeOff size={20} color={colors.mutedForeground} />
              ) : (
                <Eye size={20} color={colors.mutedForeground} />
              )}
            </Button>
          )}
        </View>
      </Glass>
    );
  }
);

Input.displayName = 'Input';

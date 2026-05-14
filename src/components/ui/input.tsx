import { TextInput, type TextInputProps, View } from 'react-native';
import { Glass } from '@/components/ui/glass';
import { useColors } from '@/hooks/use-colors';

interface InputProps extends TextInputProps {
  icon?: React.ReactNode;
}

export function Input({ icon, style, ...props }: InputProps) {
  const colors = useColors();

  return (
    <Glass radius={26}>
      <View className="flex-row items-center gap-3 px-4 h-[54px]">
        {icon}
        <TextInput
          placeholderTextColor={colors.mutedForeground}
          className="flex-1 text-foreground font-medium text-[15px] p-0"
          {...props}
        />
      </View>
    </Glass>
  );
}

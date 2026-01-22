import { Text } from '@/components/ui/text';
import { View } from 'react-native';

interface UserMessageProps {
  text: string;
}

export function UserMessage({ text }: UserMessageProps) {
  return (
    <View className="rounded-sm border border-border bg-primary px-3 py-2">
      <Text className="text-sm text-primary-foreground leading-relaxed">{text}</Text>
    </View>
  );
}

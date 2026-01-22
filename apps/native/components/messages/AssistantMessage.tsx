import { Text } from '@/components/ui/text';
import { View } from 'react-native';

interface AssistantMessageProps {
  text: string;
}

export function AssistantMessage({ text }: AssistantMessageProps) {
  return (
    <View className="rounded-sm border border-border bg-card px-3 py-2">
      <Text className="text-sm text-foreground leading-relaxed">{text}</Text>
    </View>
  );
}

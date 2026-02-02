import { ProviderIcon } from '@/components/sessions/ProviderIcon';
import { Text } from '@/components/ui/text';
import { View } from 'react-native';

interface AssistantMessageProps {
  text: string;
  providerId?: string;
}

export function AssistantMessage({ text, providerId = 'claude' }: AssistantMessageProps) {
  return (
    <View className="flex-row items-start gap-2 rounded-sm border border-border bg-card px-2.5 py-1.5">
      <View className="mt-0.5 shrink-0">
        <ProviderIcon providerId={providerId} size={16} showBackground={false} />
      </View>
      <Text className="flex-1 text-sm text-foreground leading-relaxed">{text}</Text>
    </View>
  );
}

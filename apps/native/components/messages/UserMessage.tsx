import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { UserIcon } from 'lucide-react-native';
import { View } from 'react-native';

interface UserMessageProps {
  text: string;
}

export function UserMessage({ text }: UserMessageProps) {
  return (
    <View className="flex-row items-start gap-2 rounded-sm border border-border bg-primary px-2.5 py-1.5">
      <Icon as={UserIcon} size={16} className="mt-0.5 shrink-0 text-primary-foreground" />
      <Text className="flex-1 text-sm text-primary-foreground leading-relaxed">{text}</Text>
    </View>
  );
}

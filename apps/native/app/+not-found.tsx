import { Link } from 'expo-router';
import { View } from 'react-native';
import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import { AlertCircleIcon } from 'lucide-react-native';

export default function NotFoundScreen() {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-background p-6">
      <View className="rounded-full bg-muted p-4">
        <Icon as={AlertCircleIcon} className="size-8 text-muted-foreground" />
      </View>
      <Text className="text-lg font-semibold">Page Not Found</Text>
      <Text className="text-center text-muted-foreground">
        This screen doesn&apos;t exist.
      </Text>
      <Link href="/" asChild>
        <Text className="text-primary underline">Go to home screen</Text>
      </Link>
    </View>
  );
}

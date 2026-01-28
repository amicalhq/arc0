import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ExternalLinkIcon, PlusIcon } from 'lucide-react-native';
import { Linking, Pressable, View } from 'react-native';

interface WelcomeEmptyProps {
  /** Compact mode for drawer sidebar - reduces spacing */
  compact?: boolean;
}

export function WelcomeEmpty({ compact = false }: WelcomeEmptyProps) {
  const router = useRouter();

  return (
    <View
      testID="home-welcome"
      className={`flex-1 items-center justify-center ${compact ? 'gap-4 p-4' : 'gap-6 p-6'}`}>
      <Image
        source={require('@/assets/images/splash-icon.png')}
        style={{ width: compact ? 60 : 80, height: compact ? 60 : 80 }}
        contentFit="contain"
      />

      <View className="gap-2">
        <Text className={`text-center font-semibold ${compact ? 'text-lg' : 'text-xl'}`}>
          Welcome to Arc0
        </Text>
        <Text className="text-muted-foreground text-center">
          Set up Arc0 on your workstation running Claude Code to get started.
        </Text>
      </View>

      <Pressable
        testID="connect-workstation-button"
        onPress={() => router.push({ pathname: '/settings', params: { modal: 'add-workstation' } })}
        className={`bg-primary flex-row items-center gap-2 rounded-lg active:opacity-80 ${compact ? 'px-4 py-2' : 'px-6 py-3'}`}>
        <Icon
          as={PlusIcon}
          className={`text-primary-foreground ${compact ? 'size-4' : 'size-5'}`}
        />
        <Text className="text-primary-foreground font-medium">Connect Workstation</Text>
      </Pressable>

      <Pressable
        onPress={() => Linking.openURL('https://arc0.ai/community')}
        className="flex-row items-center gap-1 px-4 py-2 active:opacity-70">
        <Text className="text-muted-foreground text-sm">Need help? Reach out on Discord</Text>
        <Icon
          as={ExternalLinkIcon}
          className={`text-muted-foreground ${compact ? 'size-3' : 'size-4'}`}
        />
      </Pressable>
    </View>
  );
}

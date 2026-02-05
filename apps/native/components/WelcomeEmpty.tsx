import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ExternalLinkIcon, PlusIcon } from 'lucide-react-native';
import { Linking, Pressable, ScrollView, View } from 'react-native';
import { useUniwind } from 'uniwind';

interface WelcomeEmptyProps {
  /** Compact mode for drawer sidebar - reduces spacing */
  compact?: boolean;
}

const INSTALL_COMMAND = 'curl -fsSL arc0.ai/install.sh | bash';

export function WelcomeEmpty({ compact = false }: WelcomeEmptyProps) {
  const router = useRouter();
  const { theme } = useUniwind();

  return (
    <ScrollView
      testID="home-welcome"
      contentContainerClassName={`flex-grow items-center justify-center ${compact ? 'gap-3 p-3' : 'gap-5 p-5'}`}
      showsVerticalScrollIndicator={false}>
      <View className="items-center gap-1">
        <Image
          source={
            theme === 'dark'
              ? require('@/assets/images/logo-full-dark.png')
              : require('@/assets/images/logo-full-light.png')
          }
          style={{ width: compact ? 100 : 140, height: compact ? 30 : 42 }}
          contentFit="contain"
        />
        <Text
          className={`text-primary text-center font-mono ${compact ? 'text-xs' : 'text-sm'}`}
          numberOfLines={compact ? 2 : 1}>
          App to command your AI Agents remotely
        </Text>
      </View>

      <View className="bg-muted px-2 py-0.5">
        <Text className="text-muted-foreground text-xs">One-time setup</Text>
      </View>

      <View className={`w-full max-w-md ${compact ? 'gap-2' : 'gap-3'}`}>
        {/* Step 1 */}
        <View className={`border-border gap-2 rounded-xl border ${compact ? 'p-3' : 'p-4'}`}>
          <View className="flex-row items-center gap-2">
            <View
              className={`bg-primary items-center justify-center rounded-full ${compact ? 'size-6' : 'size-7'}`}>
              <Text
                className={`text-primary-foreground font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
                1
              </Text>
            </View>
            <Text className={`flex-1 font-medium ${compact ? 'text-sm' : ''}`}>
              Install & Run Arc CLI
            </Text>
          </View>
          <Text className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
            Set up Arc0 on your workstation running Claude Code or Codex to get started.
          </Text>
          <View className={`bg-muted rounded-lg ${compact ? 'p-2' : 'p-3'}`}>
            <Text
              className={`text-foreground font-mono ${compact ? 'text-xs' : 'text-sm'}`}
              numberOfLines={1}
              ellipsizeMode="middle"
              selectable>
              {INSTALL_COMMAND}
            </Text>
          </View>
        </View>

        {/* Step 2 */}
        <View className={`border-border gap-2 rounded-xl border ${compact ? 'p-3' : 'p-4'}`}>
          <View className="flex-row items-center gap-2">
            <View
              className={`bg-primary items-center justify-center rounded-full ${compact ? 'size-6' : 'size-7'}`}>
              <Text
                className={`text-primary-foreground font-semibold ${compact ? 'text-xs' : 'text-sm'}`}>
                2
              </Text>
            </View>
            <Text className={`flex-1 font-medium ${compact ? 'text-sm' : ''}`}>
              Connect This Device
            </Text>
          </View>
          <Text className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
            The CLI will provide a link to connect, or add manually:
          </Text>
          <Pressable
            testID="connect-workstation-button"
            onPress={() =>
              router.push({ pathname: '/settings', params: { modal: 'add-workstation' } })
            }
            className={`border-border flex-row items-center justify-center gap-2 rounded-lg border active:opacity-70 ${compact ? 'py-2' : 'py-2.5'}`}>
            <Icon as={PlusIcon} className={`text-foreground ${compact ? 'size-3.5' : 'size-4'}`} />
            <Text className={`text-foreground font-medium ${compact ? 'text-sm' : ''}`}>
              Add Manually
            </Text>
          </Pressable>
        </View>

        {/* Info section */}
        <View className={`bg-muted/50 gap-1 rounded-xl ${compact ? 'p-2.5' : 'p-3'}`}>
          <Text className={`text-foreground font-medium ${compact ? 'text-xs' : 'text-sm'}`}>
            That's it!
          </Text>
          <Text
            className={`text-muted-foreground leading-tight ${compact ? 'text-xs' : 'text-sm'}`}>
            Sessions sync in real-time over a secure, end-to-end encrypted tunnel. Private to this
            device only. Connect any number of devices to your workstation.
          </Text>
        </View>
      </View>

      <Pressable
        onPress={() => Linking.openURL('https://arc0.ai/community')}
        className="flex-row items-center gap-1 px-4 py-2 active:opacity-70">
        <Text className={`text-muted-foreground ${compact ? 'text-xs' : 'text-sm'}`}>
          Need help? Reach out on Discord
        </Text>
        <Icon
          as={ExternalLinkIcon}
          className={`text-muted-foreground ${compact ? 'size-3' : 'size-4'}`}
        />
      </Pressable>
    </ScrollView>
  );
}

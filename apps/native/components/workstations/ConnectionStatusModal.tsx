import { Linking, Pressable, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Portal } from '@rn-primitives/portal';
import { XIcon, MessageCircleIcon, PlusIcon } from 'lucide-react-native';
import { FontAwesome6 } from '@expo/vector-icons';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useActiveWorkstation, useWorkstations } from '@/lib/store/hooks';

type SyncStatus = 'disconnected' | 'connecting' | 'connected';

interface ConnectionStatusModalProps {
  visible: boolean;
  onClose: () => void;
  syncStatus: SyncStatus;
}

const STATUS_CONFIG = {
  connected: {
    color: '#22c55e',
    label: 'Connected',
    description: 'Your workstation is connected and syncing sessions.',
  },
  connecting: {
    color: '#f59e0b',
    label: 'Connecting',
    description: 'Attempting to connect to your workstation...',
  },
  disconnected: {
    color: '#ef4444',
    label: 'Disconnected',
    description:
      'Unable to reach your workstation. The app will automatically reconnect when the arc0 client is reachable.',
  },
} as const;

export function ConnectionStatusModal({ visible, onClose, syncStatus }: ConnectionStatusModalProps) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeWorkstation = useActiveWorkstation();
  const workstations = useWorkstations();
  const hasNoWorkstations = workstations.length === 0;
  const config = STATUS_CONFIG[syncStatus];

  if (!visible) return null;

  return (
    <Portal name="connection-status">
      {/* Backdrop */}
      <Pressable
        className="absolute inset-0 bg-black/50"
        onPress={onClose}
        accessibilityRole="button"
        accessibilityLabel="Close modal"
      />

      {/* Bottom sheet */}
      <View
        className="bg-background border-border absolute right-0 bottom-0 left-0 rounded-t-2xl border-t"
        style={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        {/* Header */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <Text className="text-lg font-semibold">Connection Status</Text>
          <Pressable
            onPress={onClose}
            className="active:bg-accent rounded-lg p-2"
            accessibilityRole="button"
            accessibilityLabel="Close">
            <Icon as={XIcon} className="text-muted-foreground size-5" />
          </Pressable>
        </View>

        <View className="gap-4 px-4">
          {hasNoWorkstations ? (
            <>
              {/* No workstation state */}
              <View className="flex-row items-center gap-3">
                <FontAwesome6 name="plug-circle-xmark" size={24} color="#ef4444" />
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">No Workstation</Text>
                </View>
              </View>

              <Text className="text-muted-foreground text-sm">
                Add a workstation running the Arc0 client to start syncing your sessions.
              </Text>

              <Pressable
                onPress={() => {
                  onClose();
                  router.push({ pathname: '/settings', params: { modal: 'add-workstation' } });
                }}
                className="bg-primary flex-row items-center justify-center gap-2 rounded-lg py-2.5 active:opacity-80">
                <Icon as={PlusIcon} className="text-primary-foreground size-4" />
                <Text className="text-primary-foreground text-sm font-medium">Add Workstation</Text>
              </Pressable>

              <Pressable
                onPress={() => Linking.openURL('https://arc0.ai/community')}
                className="border-border flex-row items-center justify-center gap-2 rounded-lg border py-2.5 active:opacity-70">
                <Icon as={MessageCircleIcon} className="text-foreground size-4" />
                <Text className="text-foreground text-sm font-medium">
                  Join our Discord community
                </Text>
              </Pressable>
            </>
          ) : (
            <>
              {/* Status indicator */}
              <View className="flex-row items-center gap-3">
                <FontAwesome6
                  name={syncStatus === 'connected' ? 'plug-circle-check' : 'plug-circle-xmark'}
                  size={24}
                  color={config.color}
                />
                <View className="flex-1">
                  <Text className="text-foreground font-semibold">{config.label}</Text>
                  {activeWorkstation && (
                    <Text className="text-muted-foreground text-sm">{activeWorkstation.name}</Text>
                  )}
                </View>
              </View>

              {/* Description */}
              <Text className="text-muted-foreground text-sm">{config.description}</Text>

              {/* Instructions when disconnected */}
              {syncStatus === 'disconnected' && (
                <View className="gap-3">
                  <View className="bg-muted gap-2 rounded-lg p-3">
                    <Text className="text-foreground text-sm font-medium">
                      Check status on your workstation:
                    </Text>
                    <View className="flex-row items-center gap-2">
                      <Text className="text-muted-foreground font-mono text-sm">{'>'}</Text>
                      <View className="bg-background flex-1 rounded-md p-2">
                        <Text className="text-foreground font-mono text-sm">arc0 status</Text>
                      </View>
                    </View>
                  </View>

                  <Pressable
                    onPress={() => Linking.openURL('https://arc0.ai/community')}
                    className="border-border flex-row items-center justify-center gap-2 rounded-lg border py-2.5 active:opacity-70">
                    <Icon as={MessageCircleIcon} className="text-foreground size-4" />
                    <Text className="text-foreground text-sm font-medium">Get help on Discord</Text>
                  </Pressable>
                </View>
              )}

              {/* Discord community link */}
              {syncStatus !== 'disconnected' && (
                <Pressable
                  onPress={() => Linking.openURL('https://arc0.ai/community')}
                  className="border-border flex-row items-center justify-center gap-2 rounded-lg border py-2.5 active:opacity-70">
                  <Icon as={MessageCircleIcon} className="text-foreground size-4" />
                  <Text className="text-foreground text-sm font-medium">
                    Join our Discord community
                  </Text>
                </Pressable>
              )}
            </>
          )}
        </View>
      </View>
    </Portal>
  );
}

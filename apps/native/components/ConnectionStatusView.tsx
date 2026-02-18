import { useState } from 'react';
import { ActivityIndicator, Linking, Pressable, View } from 'react-native';
import { FontAwesome6 } from '@expo/vector-icons';
import { MessageCircleIcon, PlusIcon } from 'lucide-react-native';

import { CreateSessionModal } from '@/components/sessions';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { useConnectionStatus } from '@/lib/socket/provider';
import { useActiveWorkstation } from '@/lib/store/hooks';
import { THEME } from '@/lib/theme';
import { useUniwind } from 'uniwind';

/**
 * Detailed connection status view with contextual actions.
 * Used in the main content area (persistent) and drawer (non-persistent) when no sessions exist.
 */
export function ConnectionStatusView() {
  const { theme } = useUniwind();
  const colors = THEME[theme ?? 'light'];
  const connectionStatus = useConnectionStatus();
  const activeWorkstation = useActiveWorkstation();
  const [showCreateModal, setShowCreateModal] = useState(false);

  const isConnected = connectionStatus === 'connected';
  const isConnecting = connectionStatus === 'connecting';

  return (
    <View className="flex-1 items-center justify-center gap-6 p-6">
      {/* Connection status indicator */}
      <View className="flex-row items-center gap-3">
        <FontAwesome6
          name={isConnected ? 'plug-circle-check' : 'plug-circle-xmark'}
          size={28}
          color={
            isConnected
              ? '#22c55e'
              : isConnecting
                ? '#f59e0b'
                : '#ef4444'
          }
        />
        <View>
          <Text className="text-foreground text-lg font-semibold">
            {isConnected ? 'Connected' : isConnecting ? 'Connecting' : 'Disconnected'}
          </Text>
          {activeWorkstation && (
            <Text className="text-muted-foreground text-sm">{activeWorkstation.name}</Text>
          )}
        </View>
      </View>

      {/* Status-specific content */}
      {isConnected ? (
        <>
          <View className="gap-2">
            <Text className="text-center text-xl font-semibold">No Active Sessions</Text>
            <Text className="text-muted-foreground text-center">
              Start a new session to begin chatting with Claude.
            </Text>
          </View>
          <Pressable
            onPress={() => setShowCreateModal(true)}
            className="bg-primary flex-row items-center gap-2 rounded-lg px-6 py-3 active:opacity-80">
            <Icon as={PlusIcon} className="text-primary-foreground size-5" />
            <Text className="text-primary-foreground font-medium">Start Session</Text>
          </Pressable>
          <Pressable
            onPress={() => Linking.openURL('https://arc0.ai/community')}
            className="border-border flex-row items-center justify-center gap-2 rounded-lg border px-6 py-2.5 active:opacity-70">
            <Icon as={MessageCircleIcon} className="text-foreground size-4" />
            <Text className="text-foreground text-sm font-medium">Join our Discord community</Text>
          </Pressable>
          <CreateSessionModal visible={showCreateModal} onClose={() => setShowCreateModal(false)} />
        </>
      ) : isConnecting ? (
        <>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text className="text-muted-foreground text-center">
            Attempting to connect to your workstation...
          </Text>

          <Pressable
            onPress={() => Linking.openURL('https://arc0.ai/community')}
            className="border-border flex-row items-center justify-center gap-2 rounded-lg border px-6 py-2.5 active:opacity-70">
            <Icon as={MessageCircleIcon} className="text-foreground size-4" />
            <Text className="text-foreground text-sm font-medium">Get help on Discord</Text>
          </Pressable>
        </>
      ) : (
        <>
          <Text className="text-muted-foreground text-center">
            Unable to reach your workstation. The app will automatically reconnect when the arc0
            client is reachable.
          </Text>

          <View className="bg-muted w-full max-w-sm gap-2 rounded-lg p-3">
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
            className="border-border flex-row items-center justify-center gap-2 rounded-lg border px-6 py-2.5 active:opacity-70">
            <Icon as={MessageCircleIcon} className="text-foreground size-4" />
            <Text className="text-foreground text-sm font-medium">Get help on Discord</Text>
          </Pressable>
        </>
      )}
    </View>
  );
}

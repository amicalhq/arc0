import { Portal } from '@rn-primitives/portal';
import { XIcon } from 'lucide-react-native';
import { Pressable, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';

import { ConnectionInfo } from './sections/ConnectionInfo';
import { DataStats } from './sections/DataStats';
import { DeviceInfo } from './sections/DeviceInfo';
import { EventLog } from './sections/EventLog';
import { StoreInspector } from './sections/StoreInspector';

interface DevToolsViewProps {
  visible: boolean;
  onClose: () => void;
}

/**
 * Full-screen DevTools view.
 * Shows device info, connection status, and database stats.
 */
export function DevToolsModal({ visible, onClose }: DevToolsViewProps) {
  const insets = useSafeAreaInsets();

  if (!visible) return null;

  return (
    <Portal name="devtools">
      <View
        className="bg-background absolute inset-0"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        {/* Header */}
        <View className="border-border flex-row items-center justify-between border-b px-4 py-3">
          <Text className="text-base font-semibold">DevTools</Text>
          <Pressable
            onPress={onClose}
            className="active:bg-accent rounded-lg p-2"
            accessibilityRole="button"
            accessibilityLabel="Close">
            <Icon as={XIcon} className="text-muted-foreground size-5" />
          </Pressable>
        </View>

        {/* Content */}
        <ScrollView className="flex-1 p-4" showsVerticalScrollIndicator={false}>
          <DeviceInfo />
          <ConnectionInfo />
          <DataStats />
          <View className="border-border my-4 border-b" />
          <EventLog />
          <View className="border-border my-4 border-b" />
          <StoreInspector />
        </ScrollView>
      </View>
    </Portal>
  );
}

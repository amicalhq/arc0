import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConnectionInfo } from '@/components/devtools/sections/ConnectionInfo';
import { DataStats } from '@/components/devtools/sections/DataStats';
import { DeviceInfo } from '@/components/devtools/sections/DeviceInfo';
import { EventLog } from '@/components/devtools/sections/EventLog';
import { StoreInspector } from '@/components/devtools/sections/StoreInspector';

export default function DevelopersScreen() {
  const insets = useSafeAreaInsets();

  return (
    <View className="bg-background flex-1">
      <ScrollView
        className="flex-1 p-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 16) }}>
        <DeviceInfo />
        <ConnectionInfo />
        <DataStats />
        <View className="border-border my-4 border-b" />
        <EventLog />
        <View className="border-border my-4 border-b" />
        <StoreInspector />
      </ScrollView>
    </View>
  );
}

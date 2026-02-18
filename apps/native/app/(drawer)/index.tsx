import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useRouter, useNavigation } from 'expo-router';
import { useDrawerStatus } from '@react-navigation/drawer';
import { useIsFocused } from '@react-navigation/native';

import { ConnectionStatusView } from '@/components/ConnectionStatusView';
import { Text } from '@/components/ui/text';
import { WelcomeEmpty } from '@/components/WelcomeEmpty';
import { useConnectionStatus, useHasAttemptedInitialConnect } from '@/lib/socket/provider';
import { useWorkstations, useOpenSessions } from '@/lib/store/hooks';
import { useStoreContext } from '@/lib/store/provider';
import { useResponsiveDrawer } from '@/lib/hooks/useResponsiveDrawer';
import { THEME } from '@/lib/theme';
import { useUniwind } from 'uniwind';

export default function HomeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const drawerStatus = useDrawerStatus();
  const isFocused = useIsFocused();
  const { theme } = useUniwind();
  const colors = THEME[theme ?? 'light'];
  const { isReady: storeReady } = useStoreContext();
  const workstations = useWorkstations();
  const connectionStatus = useConnectionStatus();
  const hasAttemptedInitialConnect = useHasAttemptedInitialConnect();
  const openSessions = useOpenSessions();
  const { isPersistent } = useResponsiveDrawer();
  const hasAutoNavigatedRef = useRef(false);

  // On non-persistent, the drawer IS the index screen (100% width).
  // If it somehow closes (back button, edge swipe), re-open it to prevent dead-end empty state.
  useEffect(() => {
    if (!isPersistent && isFocused && drawerStatus === 'closed') {
      (navigation as any).openDrawer();
    }
  }, [isPersistent, isFocused, drawerStatus, navigation]);

  // Auto-navigate to first open session when connected (persistent drawer only)
  // On non-persistent drawer (mobile), let the user see the full-screen session list and tap to navigate
  const firstSessionId = openSessions[0]?.id;
  useEffect(() => {
    if (
      connectionStatus === 'connected' &&
      firstSessionId &&
      !hasAutoNavigatedRef.current &&
      isPersistent
    ) {
      hasAutoNavigatedRef.current = true;
      router.replace({ pathname: '/session/[id]/chat', params: { id: firstSessionId } });
    }
  }, [connectionStatus, firstSessionId, router, isPersistent]);

  // Reset auto-navigation flag when sessions become empty (allows re-navigation if new session created)
  useEffect(() => {
    if (openSessions.length === 0) {
      hasAutoNavigatedRef.current = false;
    }
  }, [openSessions.length]);

  // Loading: Store not ready OR SocketProvider hasn't done initial check yet
  if (!storeReady || !hasAttemptedInitialConnect) {
    return (
      <View className="bg-background flex-1">
        <View className="flex-1 items-center justify-center gap-6 p-6">
          <ActivityIndicator size="large" color={colors.primary} />
          <View className="gap-2">
            <Text className="text-center text-xl font-semibold">Connecting</Text>
            <Text className="text-muted-foreground text-center">Connecting to workstation...</Text>
          </View>
        </View>
      </View>
    );
  }

  // No workstation configured
  if (workstations.length === 0) {
    return (
      <View className="bg-background flex-1">
        <WelcomeEmpty />
      </View>
    );
  }

  // Main content area: detailed connection status + session actions
  // On non-persistent, the drawer covers this (and shows the same ConnectionStatusView)
  return (
    <View className="bg-background flex-1">
      <ConnectionStatusView />
    </View>
  );
}

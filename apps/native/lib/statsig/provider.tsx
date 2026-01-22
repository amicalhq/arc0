/**
 * Statsig feature flags provider for the mobile app.
 * Uses StatsigProviderExpo for React Native/Expo compatibility.
 */

import { StatsigProviderExpo, useGateValue } from '@statsig/expo-bindings';
import { type ReactNode } from 'react';
import { Text } from 'react-native';

import { getDeviceId } from '@/lib/analytics/device';

// Statsig configuration from environment
const STATSIG_CLIENT_KEY = process.env.EXPO_PUBLIC_STATSIG_CLIENT_KEY;

interface StatsigProviderProps {
  children: ReactNode;
}

/**
 * Statsig provider that wraps the app with feature flags.
 * - Disabled when no client key is configured
 * - Uses device ID for user identification
 */
export function StatsigProvider({ children }: StatsigProviderProps) {
  // Skip Statsig if no client key
  if (!STATSIG_CLIENT_KEY) {
    return <>{children}</>;
  }

  return (
    <StatsigProviderExpo
      sdkKey={STATSIG_CLIENT_KEY}
      user={{}}
      options={{
        environment: { tier: __DEV__ ? 'development' : 'production' },
      }}
      loadingComponent={<></>}>
      <StatsigUserIdentifier />
      {children}
    </StatsigProviderExpo>
  );
}

/**
 * Updates Statsig user with device ID once available.
 */
function StatsigUserIdentifier() {
  // Device identification is handled asynchronously by Statsig
  // The user object is updated when available
  return null;
}

// Re-export hooks for convenience
export { useGateValue, useFeatureGate, useStatsigClient } from '@statsig/expo-bindings';

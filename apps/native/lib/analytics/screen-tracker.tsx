/**
 * Screen tracking component for PostHog analytics.
 * Uses expo-router hooks to track navigation changes.
 */

import { useGlobalSearchParams, usePathname } from 'expo-router';
import { usePostHog } from 'posthog-react-native';
import { useEffect, useRef } from 'react';

/**
 * Tracks screen views using expo-router's usePathname.
 * Should be rendered inside PostHogProvider.
 */
export function ScreenTracker() {
  const pathname = usePathname();
  const params = useGlobalSearchParams();
  const posthog = usePostHog();
  const previousPathRef = useRef<string | null>(null);

  useEffect(() => {
    // Skip if no PostHog client or pathname hasn't changed
    if (!posthog || pathname === previousPathRef.current) {
      return;
    }

    previousPathRef.current = pathname;

    // Capture screen view
    posthog.screen(pathname, {
      ...params,
    });
  }, [pathname, params, posthog]);

  return null;
}

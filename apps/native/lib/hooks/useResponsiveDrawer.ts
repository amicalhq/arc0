import { Platform, useWindowDimensions } from 'react-native';

const PERSISTENT_BREAKPOINT = 1024;

export function useResponsiveDrawer() {
  const { width } = useWindowDimensions();
  const isWeb = Platform.OS === 'web';
  const isLargeScreen = width >= PERSISTENT_BREAKPOINT;
  // Enable persistent drawer on any large screen (web, tablet, iPad)
  const isPersistent = isLargeScreen;
  return { isPersistent, isWeb, isLargeScreen };
}

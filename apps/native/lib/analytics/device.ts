/**
 * Device information collection for analytics.
 * Uses expo-device and expo-application for native device properties.
 */

import * as Application from 'expo-application';
import * as Device from 'expo-device';
import { Dimensions, Platform } from 'react-native';

/**
 * Device properties sent to PostHog on identify.
 */
export interface DeviceProperties {
  platform: string;
  os_version: string | null;
  device_model: string | null;
  device_manufacturer: string | null;
  device_type: number | null;
  app_version: string | null;
  screen_width: number;
  screen_height: number;
}

/**
 * Get device properties for analytics.
 */
export function getDeviceProperties(): DeviceProperties {
  const { width, height } = Dimensions.get('window');

  return {
    platform: Device.osName ?? Platform.OS,
    os_version: Device.osVersion,
    device_model: Device.modelName,
    device_manufacturer: Device.manufacturer,
    device_type: Device.deviceType,
    app_version: Application.nativeApplicationVersion,
    screen_width: width,
    screen_height: height,
  };
}

/**
 * Get a stable device identifier for anonymous tracking.
 * On iOS: uses vendor ID (persists across app reinstalls for same vendor)
 * On Android: uses Android ID (persists across app reinstalls)
 * On Web: returns null (caller should use fallback like TinyBase device ID)
 */
export async function getDeviceId(): Promise<string | null> {
  if (Platform.OS === 'ios') {
    return Application.getIosIdForVendorAsync();
  }

  if (Platform.OS === 'android') {
    return Application.getAndroidId();
  }

  // Web doesn't have a stable device ID
  return null;
}

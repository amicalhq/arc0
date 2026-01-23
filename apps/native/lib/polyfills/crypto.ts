/**
 * Polyfill globalThis.crypto for React Native (iOS/Android).
 *
 * @noble/ciphers expects globalThis.crypto.getRandomValues to exist.
 * On web, this is already available. On native, we polyfill using expo-crypto.
 */

import { Platform } from 'react-native';
import { getRandomValues as expoGetRandomValues } from 'expo-crypto';

if (Platform.OS !== 'web') {
  if (typeof globalThis.crypto !== 'object' || globalThis.crypto === null) {
    (globalThis as any).crypto = {
      getRandomValues: expoGetRandomValues,
    };
  } else if (typeof globalThis.crypto.getRandomValues !== 'function') {
    (globalThis.crypto as any).getRandomValues = expoGetRandomValues;
  }
}

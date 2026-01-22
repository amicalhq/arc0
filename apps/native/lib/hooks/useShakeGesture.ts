import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { Accelerometer } from 'expo-sensors';

const SHAKE_THRESHOLD = 1.5; // G-force threshold
const SHAKE_TIMEOUT = 500; // Debounce in ms

export function useShakeGesture(onShake: () => void, enabled = true) {
  const lastShake = useRef(0);

  useEffect(() => {
    if (!enabled) return;

    let subscription: { remove: () => void } | null = null;

    const setup = async () => {
      // Accelerometer not supported on web
      if (Platform.OS === 'web') return;

      const available = await Accelerometer.isAvailableAsync();
      if (!available) return;

      Accelerometer.setUpdateInterval(100);

      subscription = Accelerometer.addListener(({ x, y, z }) => {
        const totalForce = Math.sqrt(x * x + y * y + z * z);
        const now = Date.now();

        if (totalForce > SHAKE_THRESHOLD && now - lastShake.current > SHAKE_TIMEOUT) {
          lastShake.current = now;
          onShake();
        }
      });
    };

    setup();

    return () => subscription?.remove();
  }, [onShake, enabled]);
}

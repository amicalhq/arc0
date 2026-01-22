import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { useShakeGesture } from '@/lib/hooks/useShakeGesture';

const DEVTOOLS_ENABLED = process.env.EXPO_PUBLIC_DEVTOOLS_ENABLED === 'true';

export function ShakeHandler() {
  const router = useRouter();

  const handleShake = useCallback(() => router.push('/developers'), [router]);

  useShakeGesture(handleShake, DEVTOOLS_ENABLED);

  return null;
}

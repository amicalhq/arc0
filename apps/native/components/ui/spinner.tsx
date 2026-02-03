import { ActivityIndicator } from 'react-native';

interface SpinnerProps {
  size?: 'small' | 'large' | number;
  color?: string;
}

/**
 * A simple spinning loader using React Native's ActivityIndicator.
 */
export function Spinner({ size = 'small', color = '#3b82f6' }: SpinnerProps) {
  return <ActivityIndicator size={size} color={color} />;
}

/**
 * WorkstationHeader: Shows active workstation name in drawer header.
 * Only visible when multiple workstations are configured.
 */

import { View } from 'react-native';

import { Text } from '@/components/ui/text';
import { useActiveWorkstation, useWorkstations } from '@/lib/store/hooks';

interface WorkstationHeaderProps {
  /** Optional className for styling */
  className?: string;
}

export function WorkstationHeader({ className }: WorkstationHeaderProps) {
  const workstations = useWorkstations();
  const activeWorkstation = useActiveWorkstation();

  // Only show when multiple workstations exist
  if (workstations.length <= 1) {
    return null;
  }

  return (
    <View className={className}>
      <Text className="text-muted-foreground text-xs" numberOfLines={1}>
        {activeWorkstation?.name ?? 'No workstation selected'}
      </Text>
    </View>
  );
}

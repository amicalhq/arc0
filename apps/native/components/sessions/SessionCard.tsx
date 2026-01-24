import { Text } from '@/components/ui/text';
import { Card } from '@/components/ui/card';
import type { Session } from '@/lib/types/session';
import { useRouter } from 'expo-router';
import { Pressable, View } from 'react-native';
import { formatRelativeTimeShort } from '@/lib/utils/time';
import { SessionInfo } from './SessionInfo';
import { SessionStatusBadge } from './SessionStatusBadge';
import { useUniwind } from 'uniwind';
import { THEME } from '@/lib/theme';
import { useEffectiveSessionStatus } from '@/lib/store/hooks';

interface SessionCardProps {
  session: Session;
  isSelected?: boolean;
  onPress?: () => void;
}

export function SessionCard({ session, isSelected = false, onPress }: SessionCardProps) {
  const router = useRouter();
  const { theme } = useUniwind();
  const colors = THEME[theme ?? 'light'];
  const statusInfo = useEffectiveSessionStatus(session);

  const handlePress = () => {
    onPress?.();
    router.push({
      pathname: '/session/[id]/chat',
      params: { id: session.id },
    });
  };

  const timeAgo = formatRelativeTimeShort(session.lastMessageAt || session.startedAt);

  return (
    <Pressable testID={`session-card-${session.id}`} onPress={handlePress} className="active:opacity-80">
      <Card
        className="mx-2 mb-2 gap-0 rounded-sm py-0"
        style={isSelected ? { borderColor: colors.primary } : undefined}>
        {/* Card content */}
        <View className="p-3">
          <SessionInfo session={session} />
        </View>

        {/* Footer with status and time */}
        <View className="border-border/20 flex-row items-center justify-between border-t px-3 py-2">
          <SessionStatusBadge status={statusInfo.status} statusDetail={statusInfo.label} />
          <Text className="text-muted-foreground text-xs">{timeAgo}</Text>
        </View>
      </Card>
    </Pressable>
  );
}

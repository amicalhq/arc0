import { Text } from '@/components/ui/text';
import { Icon } from '@/components/ui/icon';
import type { Session } from '@/lib/types/session';
import { View } from 'react-native';
import { GitBranch, Folder } from 'lucide-react-native';
import { ProviderIcon } from './ProviderIcon';
import { truncatePath } from '@/lib/utils/path';
import { formatFirstMessageForDisplay } from '@/lib/utils/session-display';

interface SessionInfoProps {
  session: Session;
  /** Size variant for different contexts */
  size?: 'default' | 'compact';
  /** Display context affects path truncation length */
  context?: 'list' | 'header';
}

// Path truncation lengths per context
const PATH_MAX_LENGTH = {
  list: 20,    // Session cards in list
  header: 40,  // Session header
} as const;

/**
 * Shared session info display used in SessionCard and SessionHeader.
 * Shows provider icon, name, project, branch, and live status.
 */
export function SessionInfo({ session, size = 'default', context = 'list' }: SessionInfoProps) {
  const isLive = !session.endedAt;
  const formattedFirstMessage = session.firstMessage ? formatFirstMessageForDisplay(session.firstMessage) : null;
  const displayName = session.name || formattedFirstMessage || `Session ${session.id.slice(-8)}`;
  const pathMaxLength = PATH_MAX_LENGTH[context];

  const iconSize = size === 'compact' ? 16 : 18;
  const nameClass = size === 'compact' ? 'text-sm font-semibold' : 'text-sm font-semibold';
  const metaIconClass = size === 'compact' ? 'size-3 text-muted-foreground' : 'size-3 text-muted-foreground';
  const metaTextClass = size === 'compact' ? 'text-xs text-muted-foreground' : 'text-xs text-muted-foreground';

  return (
    <View className="flex-row items-center flex-1">
      <View className="mr-2.5">
        <ProviderIcon providerId={session.providerId} size={iconSize} />
      </View>
      <View className="flex-1">
        {/* Session name + Live badge */}
        <View className="flex-row items-center">
          <Text className={`flex-1 ${nameClass}`} numberOfLines={1}>
            {displayName}
          </Text>
          {isLive && (
            <View className="ml-2">
              <View className="size-1.5 rounded-full bg-green-500" />
            </View>
          )}
        </View>

        {/* Project & Branch */}
        <View className="-mt-0.5 flex-row items-center">
          <Icon as={Folder} className={metaIconClass} />
          <Text className={`ml-1 font-mono ${metaTextClass}`} numberOfLines={1}>
            {truncatePath(session.projectName, pathMaxLength)}
          </Text>
          {session.gitBranch ? (
            <>
              <Text className={`mx-1.5 ${metaTextClass}`}>·</Text>
              <Icon as={GitBranch} className={metaIconClass} />
              <Text className={`ml-1 flex-1 font-mono ${metaTextClass}`} numberOfLines={1}>
                {session.gitBranch}
              </Text>
            </>
          ) : null}
        </View>
      </View>
    </View>
  );
}

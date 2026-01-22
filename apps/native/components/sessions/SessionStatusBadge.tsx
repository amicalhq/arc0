import { View } from 'react-native';
import {
  ArrowUpCircle,
  BrainIcon,
  CheckCircle,
  CircleOff,
  ClipboardCheck,
  Loader,
  MessageCircleQuestion,
  Send,
  ShieldQuestion,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';

import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Shimmer } from '@/components/ui/shimmer';
import type { SessionStatus } from '@/lib/types/session-status';

interface SessionStatusBadgeProps {
  status: SessionStatus;
  statusDetail: string;
}

/**
 * Status configuration for each session state.
 */
const STATUS_CONFIG: Record<
  SessionStatus,
  {
    icon: LucideIcon;
    colorClass: string;
  }
> = {
  sending: {
    icon: Send,
    colorClass: 'text-blue-500',
  },
  submitting: {
    icon: ArrowUpCircle,
    colorClass: 'text-blue-500',
  },
  thinking: {
    icon: BrainIcon,
    colorClass: 'text-muted-foreground',
  },
  ask_user: {
    icon: MessageCircleQuestion,
    colorClass: 'text-amber-500',
  },
  plan_approval: {
    icon: ClipboardCheck,
    colorClass: 'text-blue-500',
  },
  tool_approval: {
    icon: ShieldQuestion,
    colorClass: 'text-orange-500',
  },
  working: {
    icon: Loader,
    colorClass: 'text-green-500',
  },
  idle: {
    icon: CheckCircle,
    colorClass: 'text-muted-foreground',
  },
  ended: {
    icon: CircleOff,
    colorClass: 'text-muted-foreground',
  },
};

/**
 * Displays session status with icon and label.
 * Shows shimmer animation for thinking and working statuses.
 */
export function SessionStatusBadge({ status, statusDetail }: SessionStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.idle;
  const isAnimated =
    status === 'sending' ||
    status === 'submitting' ||
    status === 'thinking' ||
    status === 'working';

  const content = (
    <View className="flex-row items-center">
      <Icon as={config.icon} className={`size-3.5 ${config.colorClass}`} />
      <Text className={`ml-1.5 text-xs ${config.colorClass}`} numberOfLines={1}>
        {statusDetail}
      </Text>
    </View>
  );

  if (isAnimated) {
    return <Shimmer isShimmering>{content}</Shimmer>;
  }

  return content;
}

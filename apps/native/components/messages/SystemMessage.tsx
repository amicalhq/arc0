import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import type { SystemMessage as SystemMessageType } from '@/lib/types/session';
import {
  AlertCircleIcon,
  RefreshCwIcon,
  ScissorsIcon,
  TerminalIcon,
} from 'lucide-react-native';
import { View } from 'react-native';

interface SystemMessageProps {
  message: SystemMessageType;
}

function ApiErrorDisplay({ message }: { message: SystemMessageType }) {
  const errorCode = message.cause?.code || message.error?.cause?.code || 'Unknown';
  const retryAttempt = message.retryAttempt ?? 0;
  const maxRetries = message.maxRetries ?? 10;
  const retryInMs = message.retryInMs ?? 0;

  return (
    <View className="flex-row items-center gap-2 rounded-sm border border-destructive/30 bg-destructive/10 px-3 py-2">
      <Icon as={AlertCircleIcon} className="size-4 text-destructive" />
      <View className="flex-1 gap-0.5">
        <Text className="text-sm font-medium text-destructive">
          Connection Error: {errorCode}
        </Text>
        <View className="flex-row items-center gap-2">
          <Icon as={RefreshCwIcon} className="size-3 text-muted-foreground" />
          <Text className="text-xs text-muted-foreground">
            Retry {retryAttempt}/{maxRetries} in {Math.round(retryInMs / 1000)}s
          </Text>
        </View>
      </View>
    </View>
  );
}

function CompactBoundaryDisplay({ message }: { message: SystemMessageType }) {
  const preTokens = message.compactMetadata?.preTokens ?? 0;

  return (
    <View className="flex-row items-center gap-2 py-2">
      <View className="h-px flex-1 bg-border" />
      <View className="flex-row items-center gap-1.5 rounded-full bg-muted px-2.5 py-1">
        <Icon as={ScissorsIcon} className="size-3 text-muted-foreground" />
        <Text className="text-xs text-muted-foreground">
          Context compacted ({Math.round(preTokens / 1000)}k tokens)
        </Text>
      </View>
      <View className="h-px flex-1 bg-border" />
    </View>
  );
}

function LocalCommandDisplay({ message }: { message: SystemMessageType }) {
  // Parse command from content like "<command-name>/status</command-name>"
  const commandMatch = message.content?.match(/<command-name>([^<]+)<\/command-name>/);
  const command = commandMatch?.[1] || message.content || '';

  return (
    <View className="flex-row items-center gap-2 rounded-sm border border-border bg-muted/50 px-3 py-2">
      <Icon as={TerminalIcon} className="size-4 text-muted-foreground" />
      <Text className="text-sm font-mono text-muted-foreground">{command}</Text>
    </View>
  );
}

export function SystemMessage({ message }: SystemMessageProps) {
  // Only render certain subtypes - skip internal ones
  switch (message.subtype) {
    case 'api_error':
      return <ApiErrorDisplay message={message} />;
    case 'compact_boundary':
      return <CompactBoundaryDisplay message={message} />;
    case 'local_command':
      return <LocalCommandDisplay message={message} />;
    case 'stop_hook_summary':
    case 'turn_duration':
      // Internal messages - don't render
      return null;
    default:
      return null;
  }
}

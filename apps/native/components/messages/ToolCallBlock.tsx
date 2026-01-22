import { Icon } from '@/components/ui/icon';
import { Shimmer } from '@/components/ui/shimmer';
import { Text } from '@/components/ui/text';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { ToolUseResultMetadata } from '@/lib/types/session';
import { cn } from '@/lib/utils';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  ClipboardCheckIcon,
  FileIcon,
  GlobeIcon,
  HelpCircleIcon,
  ListTodoIcon,
  PencilIcon,
  PlayIcon,
  SearchIcon,
  TerminalIcon,
  WrenchIcon,
} from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
import { AskUserQuestionDisplay } from './AskUserQuestionDisplay';
import { DiffView } from './DiffView';
import { PlanApprovalDisplay } from './PlanApprovalDisplay';
import { TodoListDisplay } from './TodoListDisplay';
import { ToolApprovalDisplay } from './ToolApprovalDisplay';

interface ToolCallBlockProps {
  name: string;
  input: Record<string, unknown>;
  result?: string;
  isError?: boolean;
  metadata?: ToolUseResultMetadata;
  interactive?: boolean; // Enable interactive mode for AskUserQuestion
  isLastMessage?: boolean;
}

const TOOL_ICONS: Record<string, LucideIcon> = {
  Bash: TerminalIcon,
  Read: FileIcon,
  Write: PencilIcon,
  Edit: PencilIcon,
  Glob: SearchIcon,
  Grep: SearchIcon,
  TodoWrite: ListTodoIcon,
  AskUserQuestion: HelpCircleIcon,
  ExitPlanMode: ClipboardCheckIcon,
  Task: PlayIcon,
  WebFetch: GlobeIcon,
  WebSearch: GlobeIcon,
};

function getToolIcon(toolName: string): LucideIcon {
  return TOOL_ICONS[toolName] || WrenchIcon;
}

// Tools that have their own custom display components and don't use ToolApprovalDisplay
const CUSTOM_DISPLAY_TOOLS = new Set(['TodoWrite', 'AskUserQuestion', 'ExitPlanMode', 'EnterPlanMode']);

function getToolDescription(name: string, input: Record<string, unknown>): string | null {
  let value: string | null = null;
  switch (name) {
    case 'Bash':
      value = input.description as string | null;
      break;
    case 'Read':
    case 'Write':
    case 'Edit':
      value = input.file_path as string | null;
      break;
    case 'Glob':
      value = input.pattern as string | null;
      break;
    case 'Grep':
      value = input.pattern as string | null;
      break;
  }
  // Return null for empty strings to prevent text node errors in React Native Web
  return value || null;
}

export function ToolCallBlock({ name, input, result, isError, metadata, interactive, isLastMessage }: ToolCallBlockProps) {
  const [isOpen, setIsOpen] = useState(isLastMessage ?? false);

  const hasResult = result !== undefined;
  const ToolIcon = getToolIcon(name);
  const description = getToolDescription(name, input);
  const hasDiff = metadata?.structuredPatch && metadata.structuredPatch.length > 0;

  const iconColor = hasResult
    ? isError
      ? 'text-destructive'
      : 'text-green-500'
    : 'text-muted-foreground';

  const isPending = !hasResult;

  return (
    <View className="rounded-sm border border-border bg-card overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex-row items-center gap-2 px-3 py-2">
          <Shimmer isShimmering={isPending}>
            <Icon as={ToolIcon} className={cn('size-4', iconColor)} />
          </Shimmer>
          <View className="flex-1 flex-row items-center gap-2">
            <Shimmer isShimmering={isPending}>
              <Text className="text-sm font-medium text-foreground">{name}</Text>
            </Shimmer>
            {description && (
              <Text className="flex-1 text-xs text-muted-foreground" numberOfLines={1}>
                {description}
              </Text>
            )}
            {isPending && (
              <Shimmer isShimmering>
                <Text className="text-xs text-muted-foreground">Running...</Text>
              </Shimmer>
            )}
          </View>
          <Icon
            as={isOpen ? ChevronDownIcon : ChevronRightIcon}
            className="size-4 text-muted-foreground"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <View className="gap-2 border-t border-border bg-muted/30 px-3 py-2">
          {/* Input - custom renderers for specific tools */}
          <View>
            <Text className="mb-1 text-xs font-medium text-muted-foreground">Input</Text>
            {name === 'TodoWrite' && input.todos ? (
              <TodoListDisplay todos={input.todos as { content: string; status: 'pending' | 'in_progress' | 'completed'; activeForm?: string }[]} />
            ) : name === 'AskUserQuestion' && input.questions ? (
              <AskUserQuestionDisplay
                questions={input.questions as { question: string; header: string; options: { label: string; description: string }[]; multiSelect: boolean }[]}
                answer={result}
                interactive={interactive}
              />
            ) : name === 'ExitPlanMode' ? (
              <PlanApprovalDisplay
                planFilePath={input.planFilePath as string | undefined}
                planContent={input.plan as string | undefined}
                answer={result}
                interactive={interactive}
              />
            ) : !CUSTOM_DISPLAY_TOOLS.has(name) ? (
              <ToolApprovalDisplay
                toolName={name}
                input={input}
                answer={result}
                isError={isError}
                interactive={interactive}
              />
            ) : (
              <Text className="font-mono text-xs leading-relaxed text-muted-foreground">
                {JSON.stringify(input, null, 2)}
              </Text>
            )}
          </View>

          {/* Diff View for Edit operations */}
          {hasDiff && metadata?.structuredPatch && (
            <View className="border-t border-border pt-2">
              <Text className="mb-1 text-xs font-medium text-muted-foreground">Changes</Text>
              <DiffView patches={metadata.structuredPatch} />
            </View>
          )}

          {/* Result */}
          {hasResult && !hasDiff && (
            <View className="border-t border-border pt-2">
              <Text
                className={cn(
                  'mb-1 text-xs font-medium',
                  isError ? 'text-destructive' : 'text-green-500'
                )}
              >
                {isError ? 'Error' : 'Result'}
              </Text>
              <Text
                className={cn(
                  'font-mono text-xs leading-relaxed',
                  isError ? 'text-destructive' : 'text-muted-foreground'
                )}
              >
                {result}
              </Text>
            </View>
          )}
          </View>
        </CollapsibleContent>
      </Collapsible>
    </View>
  );
}

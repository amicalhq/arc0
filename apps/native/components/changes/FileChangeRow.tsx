import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DiffView } from '@/components/messages/DiffView';
import type { FileChangeItem } from '@/lib/types/session';
import { parseDiffToPatches, countDiffChanges } from '@/lib/utils/diff';
import { getFileTypeIcon } from '@/lib/utils/file-icons';
import { cn } from '@/lib/utils';
import { ChevronDownIcon, ChevronRightIcon, FileIcon } from 'lucide-react-native';
import { View } from 'react-native';
import { useUniwind } from 'uniwind';

interface FileChangeRowProps {
  change: FileChangeItem;
  expanded: boolean;
  onToggle: () => void;
}

function truncatePath(path: string, maxLength: number = 30): string | null {
  const parts = path.split('/');
  if (parts.length <= 2) {
    const dir = parts.slice(0, -1).join('/');
    return dir || null; // Return null for empty strings to prevent text node errors
  }

  const dirPath = parts.slice(0, -1).join('/');
  if (dirPath.length <= maxLength) return dirPath;

  return '...' + dirPath.slice(-(maxLength - 3));
}

function getOperationStatus(operation: FileChangeItem['operation']): {
  letter: string;
  bgColor: string;
  textColor: string;
} {
  switch (operation) {
    case 'create':
      return { letter: 'A', bgColor: 'bg-green-500/15', textColor: 'text-green-600' };
    case 'edit':
      return { letter: 'M', bgColor: 'bg-yellow-500/15', textColor: 'text-yellow-600' };
    case 'delete':
      return { letter: 'D', bgColor: 'bg-red-500/15', textColor: 'text-red-600' };
  }
}

export function FileChangeRow({ change, expanded, onToggle }: FileChangeRowProps) {
  const { theme } = useUniwind();
  const fileName = change.path.split('/').pop() || change.path;
  const dirPath = truncatePath(change.path);
  const { additions, deletions } = countDiffChanges(change.diff);
  const patches = parseDiffToPatches(change.diff);
  const status = getOperationStatus(change.operation);
  const FileTypeIcon = getFileTypeIcon(change.path);
  // Color for monochrome icons (those using currentColor)
  const iconColor = theme === 'dark' ? '#fafafa' : '#0a0a0a';

  return (
    <View className="border-border mb-1.5 overflow-hidden rounded-md border">
      <Collapsible open={expanded} onOpenChange={onToggle}>
        <CollapsibleTrigger className="active:bg-muted/10 flex-row items-center gap-2 px-2.5 py-2">
          {/* File icon */}
          {FileTypeIcon ? (
            <FileTypeIcon width={18} height={18} color={iconColor} stroke={iconColor} />
          ) : (
            <Icon as={FileIcon} className="text-muted-foreground size-4" />
          )}

          {/* File name, badge, and path */}
          <View className="min-w-0 flex-1">
            <View className="flex-row items-center gap-1.5">
              <Text className="text-foreground shrink text-sm font-medium" numberOfLines={1}>
                {fileName}
              </Text>
              <View className={cn('rounded px-1 py-px', status.bgColor)}>
                <Text className={cn('text-[10px] font-bold', status.textColor)}>
                  {status.letter}
                </Text>
              </View>
            </View>
            {dirPath && (
              <Text className="text-muted-foreground text-xs" numberOfLines={1}>
                {dirPath}
              </Text>
            )}
          </View>

          {/* Change counts */}
          {(additions > 0 || deletions > 0) && (
            <View className="flex-row items-center gap-1">
              {additions > 0 && (
                <Text className="text-xs font-medium text-green-500">+{additions}</Text>
              )}
              {deletions > 0 && (
                <Text className="text-xs font-medium text-red-500">-{deletions}</Text>
              )}
            </View>
          )}

          {/* Expand/collapse chevron */}
          <Icon
            as={expanded ? ChevronDownIcon : ChevronRightIcon}
            className="text-muted-foreground size-4"
          />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <View className="border-border bg-muted/30 border-t px-2 py-1.5">
            {patches.length > 0 ? (
              <DiffView patches={patches} />
            ) : (
              <Text className="text-muted-foreground text-xs italic">No diff available</Text>
            )}
          </View>
        </CollapsibleContent>
      </Collapsible>
    </View>
  );
}

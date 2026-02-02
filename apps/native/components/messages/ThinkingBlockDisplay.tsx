import { Icon } from '@/components/ui/icon';
import { Shimmer } from '@/components/ui/shimmer';
import { Text } from '@/components/ui/text';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { BrainIcon, ChevronDownIcon, ChevronRightIcon } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';

interface ThinkingBlockDisplayProps {
  thinking: string;
  isInProgress?: boolean;
}

export function ThinkingBlockDisplay({ thinking, isInProgress = false }: ThinkingBlockDisplayProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className="rounded-sm border border-border bg-background overflow-hidden">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="flex-row items-center gap-2 px-2.5 py-1.5">
          <Shimmer isShimmering={isInProgress}>
            <Icon as={BrainIcon} className="size-4 text-muted-foreground" />
          </Shimmer>
          <Shimmer isShimmering={isInProgress}>
            <Text className="text-sm text-muted-foreground">
              {isInProgress ? 'Thinking...' : 'Thinking'}
            </Text>
          </Shimmer>
          <Icon
            as={isOpen ? ChevronDownIcon : ChevronRightIcon}
            className="size-4 text-muted-foreground"
          />
        </CollapsibleTrigger>
        <CollapsibleContent>
          <View className="border-t border-border bg-muted/30 px-2.5 py-1.5">
            <Text className="text-sm italic text-muted-foreground leading-relaxed">
              {thinking || 'Processing...'}
            </Text>
          </View>
        </CollapsibleContent>
      </Collapsible>
    </View>
  );
}

/**
 * Inline bar for selecting prompt mode and model.
 * Displays two compact select dropdowns side by side.
 * On native platforms, only visible when input is focused.
 */

import { cn } from '@/lib/utils';
import * as SelectPrimitive from '@rn-primitives/select';
import { Check, ChevronDown } from 'lucide-react-native';
import { Platform, StyleSheet, View } from 'react-native';
import type { ModelId, PromptMode } from '@arc0/types';
import { Icon } from '@/components/ui/icon';

// =============================================================================
// Types
// =============================================================================

interface ModeModelBarProps {
  mode: PromptMode;
  model: ModelId;
  onModeChange: (mode: PromptMode) => void;
  onModelChange: (model: ModelId) => void;
  disabled?: boolean;
  visible?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

const MODE_OPTIONS: { value: PromptMode; label: string }[] = [
  { value: 'default', label: 'Auto' },
  { value: 'ask', label: 'Ask' },
  { value: 'plan', label: 'Plan' },
  { value: 'bypass', label: 'Bypass' },
];

const MODEL_OPTIONS: { value: ModelId; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'sonnet-4.5', label: 'Sonnet' },
  { value: 'opus-4.5', label: 'Opus' },
  { value: 'haiku-4.5', label: 'Haiku' },
];

// =============================================================================
// Component
// =============================================================================

export function ModeModelBar({
  mode,
  model,
  onModeChange,
  onModelChange,
  disabled = false,
  visible = true,
}: ModeModelBarProps) {
  const selectedMode = MODE_OPTIONS.find((opt) => opt.value === mode);
  const selectedModel = MODEL_OPTIONS.find((opt) => opt.value === model);

  // On native, respect visibility prop. On web, always show.
  const isNative = Platform.OS !== 'web';
  if (isNative && !visible) {
    return null;
  }

  return (
    <View className="bg-background flex-row items-center gap-3 px-4 py-2">
      {/* Mode Select */}
      <SelectPrimitive.Root
        value={selectedMode ? { value: selectedMode.value, label: selectedMode.label } : undefined}
        onValueChange={(option) => {
          if (option && !disabled) {
            onModeChange(option.value as PromptMode);
          }
        }}>
        <SelectPrimitive.Trigger
          disabled={disabled}
          className={cn(
            'border-input bg-background flex h-8 flex-row items-center justify-between gap-2 rounded-md border px-3 py-1.5',
            disabled && 'opacity-50'
          )}>
          <SelectPrimitive.Value
            className="text-foreground text-sm"
            placeholder="Mode"
          />
          <Icon as={ChevronDown} className="text-muted-foreground size-4" />
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Overlay style={Platform.OS !== 'web' ? StyleSheet.absoluteFill : undefined}>
            <SelectPrimitive.Content
              className="bg-popover border-border z-50 min-w-[8rem] rounded-md border p-1"
              side="top"
              sideOffset={4}>
              <SelectPrimitive.Viewport>
                {MODE_OPTIONS.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    className="active:bg-accent relative flex w-full flex-row items-center rounded-sm py-2 pl-2 pr-8">
                    <SelectPrimitive.ItemText className="text-foreground text-sm" />
                    <View className="absolute right-2">
                      <SelectPrimitive.ItemIndicator>
                        <Icon as={Check} className="text-foreground size-4" />
                      </SelectPrimitive.ItemIndicator>
                    </View>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Overlay>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>

      {/* Model Select */}
      <SelectPrimitive.Root
        value={selectedModel ? { value: selectedModel.value, label: selectedModel.label } : undefined}
        onValueChange={(option) => {
          if (option && !disabled) {
            onModelChange(option.value as ModelId);
          }
        }}>
        <SelectPrimitive.Trigger
          disabled={disabled}
          className={cn(
            'border-input bg-background flex h-8 flex-row items-center justify-between gap-2 rounded-md border px-3 py-1.5',
            disabled && 'opacity-50'
          )}>
          <SelectPrimitive.Value
            className="text-foreground text-sm"
            placeholder="Model"
          />
          <Icon as={ChevronDown} className="text-muted-foreground size-4" />
        </SelectPrimitive.Trigger>

        <SelectPrimitive.Portal>
          <SelectPrimitive.Overlay style={Platform.OS !== 'web' ? StyleSheet.absoluteFill : undefined}>
            <SelectPrimitive.Content
              className="bg-popover border-border z-50 min-w-[8rem] rounded-md border p-1"
              side="top"
              sideOffset={4}>
              <SelectPrimitive.Viewport>
                {MODEL_OPTIONS.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    label={option.label}
                    className="active:bg-accent relative flex w-full flex-row items-center rounded-sm py-2 pl-2 pr-8">
                    <SelectPrimitive.ItemText className="text-foreground text-sm" />
                    <View className="absolute right-2">
                      <SelectPrimitive.ItemIndicator>
                        <Icon as={Check} className="text-foreground size-4" />
                      </SelectPrimitive.ItemIndicator>
                    </View>
                  </SelectPrimitive.Item>
                ))}
              </SelectPrimitive.Viewport>
            </SelectPrimitive.Content>
          </SelectPrimitive.Overlay>
        </SelectPrimitive.Portal>
      </SelectPrimitive.Root>
    </View>
  );
}

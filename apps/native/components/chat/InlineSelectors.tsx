/**
 * Inline mode/model selectors for web.
 * Displays minimal text-style dropdowns inside the composer.
 */

import { View } from 'react-native';
import type { ModelId, PromptMode } from '@arc0/types';
import { ToolSelect } from './ToolSelect';

// =============================================================================
// Types
// =============================================================================

interface InlineSelectorsProps {
  mode: PromptMode;
  model: ModelId;
  onModeChange: (mode: PromptMode) => void;
  onModelChange: (model: ModelId) => void;
  disabled?: boolean;
}

// =============================================================================
// Constants
// =============================================================================

export const MODE_OPTIONS: { value: PromptMode; label: string }[] = [
  { value: 'default', label: 'Auto' },
  { value: 'ask', label: 'Ask' },
  { value: 'plan', label: 'Plan' },
  { value: 'bypass', label: 'Bypass' },
];

export const MODEL_OPTIONS: { value: ModelId; label: string }[] = [
  { value: 'default', label: 'Default' },
  { value: 'sonnet-4.5', label: 'Sonnet' },
  { value: 'opus-4.5', label: 'Opus' },
  { value: 'haiku-4.5', label: 'Haiku' },
];

// =============================================================================
// Component
// =============================================================================

export function InlineSelectors({
  mode,
  model,
  onModeChange,
  onModelChange,
  disabled = false,
}: InlineSelectorsProps) {
  return (
    <View className="flex-row items-center gap-1">
      <ToolSelect
        value={mode}
        options={MODE_OPTIONS}
        onValueChange={(val) => onModeChange(val as PromptMode)}
        placeholder="Mode"
        disabled={disabled}
      />
      <ToolSelect
        value={model}
        options={MODEL_OPTIONS}
        onValueChange={(val) => onModelChange(val as ModelId)}
        placeholder="Model"
        disabled={disabled}
      />
    </View>
  );
}

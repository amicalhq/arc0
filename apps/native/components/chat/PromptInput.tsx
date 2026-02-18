/**
 * Prompt input component for the chat composer.
 * Includes the text input, mode/model selectors, and send/stop buttons.
 */

import { useRef, useState } from 'react';
import { ActivityIndicator, Platform, Pressable, TextInput, View } from 'react-native';
import { KeyboardStickyView } from 'react-native-keyboard-controller';
import { SendIcon } from 'lucide-react-native';
import type { ModelId, PromptMode } from '@arc0/types';

import { Icon } from '@/components/ui/icon';
import { THEME } from '@/lib/theme';
import { useUniwind } from 'uniwind';

import { ComposerOptionsSheet } from './ComposerOptionsSheet';
import { InlineSelectors } from './InlineSelectors';
import { MobileChips } from './MobileChips';
import { StopButton } from './StopButton';

// On web, use a plain View instead of KeyboardStickyView. The CSS transform
// from KeyboardStickyView creates a stacking context that interferes with
// Radix Select dropdowns. Browsers handle keyboard avoidance natively.
const NativeKeyboardView = (props: React.ComponentProps<typeof View>) => (
  <KeyboardStickyView offset={{ opened: 0, closed: 0 }} {...props} />
);
const KeyboardView = Platform.OS === 'web' ? View : NativeKeyboardView;

// =============================================================================
// Types
// =============================================================================

interface PromptInputProps {
  /** Current input text value */
  value: string;
  /** Callback when input text changes */
  onChangeText: (text: string) => void;
  /** Placeholder text */
  placeholder: string;
  /** Whether placeholder should use primary color (for selections) */
  highlightPlaceholder?: boolean;
  /** Callback when submit is triggered */
  onSubmit: () => void;
  /** Whether submit is allowed */
  canSubmit: boolean;
  /** Whether currently submitting */
  isSubmitting?: boolean;
  /** Whether input is editable */
  editable?: boolean;
  /** Current mode value */
  mode: PromptMode;
  /** Callback when mode changes */
  onModeChange: (mode: PromptMode) => void;
  /** Current model value */
  model: ModelId;
  /** Callback when model changes */
  onModelChange: (model: ModelId) => void;
  /** Whether to show mode/model selectors */
  showSelectors?: boolean;
  /** Whether agent is running (shows stop button) */
  agentRunning?: boolean;
  /** Callback when stop is pressed */
  onStop?: () => void;
  /** Whether stop action is in progress */
  isStopping?: boolean;
  /** Callback to handle key press (for web Enter to submit) */
  onKeyPress?: (e: { nativeEvent: { key: string; shiftKey?: boolean } }) => void;
}

// =============================================================================
// Component
// =============================================================================

export function PromptInput({
  value,
  onChangeText,
  placeholder,
  highlightPlaceholder = false,
  onSubmit,
  canSubmit,
  isSubmitting = false,
  editable = true,
  mode,
  onModeChange,
  model,
  onModelChange,
  showSelectors = true,
  agentRunning = false,
  onStop,
  isStopping = false,
  onKeyPress,
}: PromptInputProps) {
  const { theme } = useUniwind();
  const colors = THEME[theme ?? 'light'];
  const inputRef = useRef<TextInput>(null);
  const [inputHeight, setInputHeight] = useState(44);
  const [optionsSheetOpen, setOptionsSheetOpen] = useState(false);
  const isWeb = Platform.OS === 'web';

  return (
    <>
      <KeyboardView>
        <View className="border-border bg-background mx-2 mb-2 rounded-sm border">
          <TextInput
            testID="message-input"
            ref={inputRef}
            placeholder={placeholder}
            placeholderTextColor={highlightPlaceholder ? colors.primary : colors.mutedForeground}
            value={value}
            onChangeText={onChangeText}
            onKeyPress={onKeyPress}
            editable={editable}
            className="text-foreground px-4 pt-3 pb-1"
            multiline
            onContentSizeChange={(e) => {
              const height = e.nativeEvent.contentSize.height;
              setInputHeight(Math.min(Math.max(44, height), 120));
            }}
            style={
              Platform.OS === 'web'
                ? ({ height: inputHeight, resize: 'none', outline: 'none' } as unknown as object)
                : { height: inputHeight }
            }
          />

          <View className="native:pb-2 flex-row items-center justify-between pr-2 pb-1.5 pl-2">
            {/* Left side: Mode/Model selectors */}
            {showSelectors ? (
              isWeb ? (
                <InlineSelectors
                  mode={mode}
                  model={model}
                  onModeChange={onModeChange}
                  onModelChange={onModelChange}
                  disabled={isSubmitting}
                />
              ) : (
                <MobileChips
                  mode={mode}
                  model={model}
                  onPress={() => setOptionsSheetOpen(true)}
                  disabled={isSubmitting}
                />
              )
            ) : null}

            {/* Right side: Send/Stop button */}
            {agentRunning ? (
              <StopButton onPress={onStop!} isLoading={isStopping} disabled={isStopping} />
            ) : (
              <Pressable
                testID="send-button"
                onPress={onSubmit}
                disabled={!canSubmit}
                className="bg-primary rounded-sm p-2 active:opacity-80 disabled:opacity-50">
                {isSubmitting ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Icon as={SendIcon} className="text-primary-foreground size-4" />
                )}
              </Pressable>
            )}
          </View>
        </View>
      </KeyboardView>

      {/* Mobile options sheet */}
      {!isWeb && (
        <ComposerOptionsSheet
          open={optionsSheetOpen}
          onClose={() => setOptionsSheetOpen(false)}
          mode={mode}
          model={model}
          onModeChange={onModeChange}
          onModelChange={onModelChange}
        />
      )}
    </>
  );
}

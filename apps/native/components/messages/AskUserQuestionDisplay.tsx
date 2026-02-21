import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Text } from '@/components/ui/text';
import { OTHER_OPTION, usePendingQuestionSafe } from '@/lib/contexts/PendingQuestionContext';
import { cn } from '@/lib/utils';
import { Pressable, View } from 'react-native';

interface QuestionOption {
  label: string;
  description: string;
}

interface Question {
  question: string;
  header: string;
  options: QuestionOption[];
  multiSelect: boolean;
}

interface AskUserQuestionDisplayProps {
  questions: Question[];
  answer?: string; // Raw tool_result content
  awaitingInput?: boolean;
  toolUseId?: string; // For tracking which question this is
}

// Parse answers from the output string format:
// "User has answered your questions: "Question1"="Answer1", "Question2"="Answer2"..."
// For multi-select, answers are comma-separated: "Option A, Option B, Option C"
function parseAnswers(output: string | undefined): Map<string, string> {
  const answers = new Map<string, string>();
  if (!output) return answers;

  // Match patterns like "Question"="Answer"
  const regex = /"([^"]+)"="([^"]+)"/g;
  let match;
  while ((match = regex.exec(output)) !== null) {
    answers.set(match[1], match[2]);
  }
  return answers;
}

// Parse multi-select answer into array of selected options
function parseMultiSelectAnswer(answer: string | undefined): string[] {
  if (!answer) return [];
  // Split by comma and trim whitespace
  return answer.split(',').map((s) => s.trim());
}

// Check if an option is selected (works for both single and multi-select)
function isOptionSelected(
  optionLabel: string,
  answeredValue: string | undefined,
  isMultiSelect: boolean
): boolean {
  if (!answeredValue) return false;

  if (isMultiSelect) {
    const selectedOptions = parseMultiSelectAnswer(answeredValue);
    return selectedOptions.some((selected) => selected === optionLabel);
  }

  return answeredValue === optionLabel;
}

// Check if the answer is a custom "Other" response (not matching any predefined options)
function isCustomAnswer(
  answeredValue: string | undefined,
  options: QuestionOption[],
  isMultiSelect: boolean
): boolean {
  if (!answeredValue) return false;

  if (isMultiSelect) {
    const selectedOptions = parseMultiSelectAnswer(answeredValue);
    // Check if any selected option is not in the predefined options
    return selectedOptions.some((selected) => !options.some((opt) => opt.label === selected));
  }

  return !options.some((opt) => opt.label === answeredValue);
}

// Get the custom part of the answer (options not in predefined list)
function getCustomAnswerText(
  answeredValue: string | undefined,
  options: QuestionOption[],
  isMultiSelect: boolean
): string {
  if (!answeredValue) return '';

  if (isMultiSelect) {
    const selectedOptions = parseMultiSelectAnswer(answeredValue);
    const customOptions = selectedOptions.filter(
      (selected) => !options.some((opt) => opt.label === selected)
    );
    return customOptions.join(', ');
  }

  return answeredValue;
}

// Check if option is selected from context selections
function isContextSelected(
  optionLabel: string,
  selections: Map<number, string | string[]>,
  questionIndex: number,
  isMultiSelect: boolean
): boolean {
  const selection = selections.get(questionIndex);
  if (!selection) return false;

  if (isMultiSelect && Array.isArray(selection)) {
    return selection.includes(optionLabel);
  }

  return selection === optionLabel;
}

function SingleSelectQuestion({
  question,
  questionIndex,
  answeredValue,
  awaitingInput,
}: {
  question: Question;
  questionIndex: number;
  answeredValue?: string;
  awaitingInput?: boolean;
}) {
  const context = usePendingQuestionSafe();
  const hasCustomAnswer = isCustomAnswer(answeredValue, question.options, false);
  const existingCustomText = hasCustomAnswer ? answeredValue : '';

  // Get selection from context if awaiting input
  const contextSelection = context?.selections.get(questionIndex);
  const hasContextSelection = contextSelection !== undefined;
  const isOtherSelected = contextSelection === OTHER_OPTION;
  const isSubmitting = context?.isSubmitting ?? false;

  // Disable interactions while submitting
  const isEnabled = awaitingInput && !isSubmitting;

  return (
    <RadioGroup
      value={isEnabled && hasContextSelection ? (contextSelection as string) : answeredValue}
      onValueChange={() => {}}
      disabled={!isEnabled}>
      <View className="gap-1.5">
        {question.options.map((opt, optIndex) => {
          // Determine if selected: use context selection when awaiting input, otherwise use answeredValue
          const isSelected = isEnabled
            ? isContextSelected(opt.label, context?.selections ?? new Map(), questionIndex, false)
            : answeredValue === opt.label;

          // Determine if should be dimmed
          const shouldDim = isEnabled
            ? hasContextSelection && !isSelected
            : answeredValue && !isSelected;

          const handlePress = () => {
            if (isEnabled && context) {
              context.selectOption(questionIndex, opt.label);
            }
          };

          const content = (
            <View
              className={cn(
                'flex-row items-center rounded-lg border px-3 py-2',
                isSelected ? 'border-primary bg-primary/10' : 'border-border',
                shouldDim ? 'opacity-50' : 'opacity-100',
                isSubmitting ? 'opacity-60' : ''
              )}>
              <RadioGroupItem value={opt.label} />
              <View className="ml-2 flex-1">
                <Text
                  className={cn(
                    'text-xs font-medium',
                    isSelected ? 'text-primary' : 'text-foreground'
                  )}>
                  {opt.label}
                </Text>
                {opt.description && (
                  <Text className="text-muted-foreground mt-0.5 text-[10px]">
                    {opt.description}
                  </Text>
                )}
              </View>
            </View>
          );

          if (isEnabled) {
            return (
              <Pressable key={optIndex} onPress={handlePress}>
                {content}
              </Pressable>
            );
          }

          return <View key={optIndex}>{content}</View>;
        })}

        {/* "Other" option (only shown when awaiting input) */}
        {isEnabled && (
          <Pressable
            onPress={() => {
              if (context) {
                context.selectOption(questionIndex, OTHER_OPTION);
              }
            }}>
            <View
              className={cn(
                'flex-row items-center rounded-lg border px-3 py-2',
                isOtherSelected ? 'border-primary bg-primary/10' : 'border-border',
                hasContextSelection && !isOtherSelected ? 'opacity-50' : 'opacity-100'
              )}>
              <RadioGroupItem value={OTHER_OPTION} />
              <View className="ml-2 flex-1">
                <Text
                  className={cn(
                    'text-xs font-medium',
                    isOtherSelected ? 'text-primary' : 'text-foreground'
                  )}>
                  Other
                </Text>
                <Text className="text-muted-foreground mt-0.5 text-[10px]">
                  Type in the input box below
                </Text>
              </View>
            </View>
          </Pressable>
        )}

        {/* Custom "Other" response (only shown for already-answered questions) */}
        {!awaitingInput && hasCustomAnswer && existingCustomText && (
          <View className="border-primary bg-primary/10 flex-row items-center rounded-lg border px-3 py-2">
            <RadioGroupItem value={existingCustomText} />
            <View className="ml-2 flex-1">
              <Text className="text-primary text-xs font-medium">
                Other: &quot;{existingCustomText}&quot;
              </Text>
            </View>
          </View>
        )}
      </View>
    </RadioGroup>
  );
}

function MultiSelectQuestion({
  question,
  questionIndex,
  answeredValue,
  awaitingInput,
}: {
  question: Question;
  questionIndex: number;
  answeredValue?: string;
  awaitingInput?: boolean;
}) {
  const context = usePendingQuestionSafe();
  const hasCustomAnswer = isCustomAnswer(answeredValue, question.options, true);
  const customText = hasCustomAnswer
    ? getCustomAnswerText(answeredValue, question.options, true)
    : '';
  const isSubmitting = context?.isSubmitting ?? false;

  // Disable interactions while submitting
  const isEnabled = awaitingInput && !isSubmitting;

  // Get selection from context if awaiting input
  const contextSelection = context?.selections.get(questionIndex);
  const hasContextSelection = contextSelection !== undefined;

  return (
    <View className="gap-1.5">
      {question.options.map((opt, optIndex) => {
        // Determine if selected: use context selection when awaiting input, otherwise use answeredValue
        const isSelected = isEnabled
          ? isContextSelected(opt.label, context?.selections ?? new Map(), questionIndex, true)
          : isOptionSelected(opt.label, answeredValue, true);

        // Determine if should be dimmed
        const shouldDim = isEnabled
          ? hasContextSelection && !isSelected
          : answeredValue && !isSelected;

        const handlePress = () => {
          if (isEnabled && context) {
            context.toggleOption(questionIndex, opt.label);
          }
        };

        const content = (
          <View
            className={cn(
              'flex-row items-center rounded-lg border px-3 py-2',
              isSelected ? 'border-primary bg-primary/10' : 'border-border',
              shouldDim ? 'opacity-50' : 'opacity-100',
              isSubmitting ? 'opacity-60' : ''
            )}>
            <Checkbox checked={isSelected} onCheckedChange={() => {}} disabled={!isEnabled} />
            <View className="ml-2 flex-1">
              <Text
                className={cn(
                  'text-xs font-medium',
                  isSelected ? 'text-primary' : 'text-foreground'
                )}>
                {opt.label}
              </Text>
              {opt.description && (
                <Text className="text-muted-foreground mt-0.5 text-[10px]">{opt.description}</Text>
              )}
            </View>
          </View>
        );

        if (isEnabled) {
          return (
            <Pressable key={optIndex} onPress={handlePress}>
              {content}
            </Pressable>
          );
        }

        return <View key={optIndex}>{content}</View>;
      })}

      {/* Custom "Other" response (only shown for answered questions) */}
      {hasCustomAnswer && customText && (
        <View className="border-primary bg-primary/10 flex-row items-center rounded-lg border px-3 py-2">
          <Checkbox checked onCheckedChange={() => {}} disabled />
          <View className="ml-2 flex-1">
            <Text className="text-primary text-xs font-medium">
              Other: &quot;{customText}&quot;
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

function QuestionSection({
  question,
  questionIndex,
  answeredValue,
  awaitingInput,
}: {
  question: Question;
  questionIndex: number;
  answeredValue?: string;
  awaitingInput?: boolean;
}) {
  return (
    <View className="mb-3">
      {/* Header chip */}
      <View className="mb-1 flex-row items-center gap-1.5">
        <View className="bg-muted/50 rounded px-2 py-0.5">
          <Text className="text-muted-foreground text-[10px] font-medium">{question.header}</Text>
        </View>
      </View>

      {/* Question text */}
      <Text className="text-foreground mb-2 text-xs">{question.question}</Text>

      {/* Options */}
      {question.multiSelect ? (
        <MultiSelectQuestion
          question={question}
          questionIndex={questionIndex}
          answeredValue={answeredValue}
          awaitingInput={awaitingInput}
        />
      ) : (
        <SingleSelectQuestion
          question={question}
          questionIndex={questionIndex}
          answeredValue={answeredValue}
          awaitingInput={awaitingInput}
        />
      )}
    </View>
  );
}

export function AskUserQuestionDisplay({
  questions,
  answer,
  awaitingInput,
}: AskUserQuestionDisplayProps) {
  const context = usePendingQuestionSafe();
  const isSubmitting = context?.isSubmitting ?? false;

  if (!questions || questions.length === 0) {
    return null;
  }

  const existingAnswers = parseAnswers(answer);
  const isPending = !answer;

  return (
    <View>
      {questions.map((q, qIndex) => {
        const answeredValue = existingAnswers.get(q.question);
        return (
          <QuestionSection
            key={qIndex}
            question={q}
            questionIndex={qIndex}
            answeredValue={answeredValue}
            awaitingInput={awaitingInput && isPending}
          />
        );
      })}
      {/* Sending indicator when submitting */}
      {isSubmitting && (
        <View className="mt-2 flex-row items-center">
          <View className="bg-primary mr-2 size-2 animate-pulse rounded-full" />
          <Text className="text-primary text-[10px] italic">Sending response...</Text>
        </View>
      )}
      {/* Only show awaiting indicator if pending and NOT awaiting input and NOT submitting */}
      {isPending && !awaitingInput && !isSubmitting && (
        <View className="mt-2 flex-row items-center">
          <View className="bg-primary/20 mr-2 size-2 rounded-full" />
          <Text className="text-muted-foreground text-[10px] italic">Awaiting response...</Text>
        </View>
      )}
    </View>
  );
}

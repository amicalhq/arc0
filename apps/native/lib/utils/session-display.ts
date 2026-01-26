/**
 * UI-level display formatting for session first messages.
 * Transforms raw first messages into user-friendly display text.
 *
 * This is presentation-only - storage remains unchanged.
 * Add new transformations here as needed.
 */

type DisplayTransform = (text: string) => string | null;

/**
 * Ordered list of display transformations.
 * Each returns transformed text or null to try the next transform.
 * Add new transformations here as display needs evolve.
 */
const displayTransforms: DisplayTransform[] = [
  // Extract command name from <command-name>/foo</command-name> → "/foo"
  (text) => {
    const match = text.match(/^\s*<command-name>\s*\/?([^<]+?)\s*<\/command-name>/);
    if (match) {
      const commandName = match[1].trim();
      return `/${commandName}`;
    }
    return null;
  },

  // Strip "Implement the following plan: # Plan: " prefix
  (text) => {
    const match = text.match(/^\s*Implement the following plan:\s*#\s*Plan:\s*/i);
    if (match) {
      return text.slice(match[0].length).trim();
    }
    return null;
  },
];

/**
 * Format a first message for display.
 * Applies transformations to make raw messages more user-friendly.
 *
 * @param firstMessage - Raw first message from storage
 * @returns Formatted display text
 */
export function formatFirstMessageForDisplay(firstMessage: string): string {
  let result = firstMessage;

  for (const transform of displayTransforms) {
    const transformed = transform(result);
    if (transformed !== null) {
      result = transformed;
      // Continue applying transforms to the result
    }
  }

  return result;
}

// =============================================================================
// Local command parsing (Claude)
// =============================================================================

export function parseLocalCommand(
  content: string,
): { commandName: string; commandArgs: string } | null {
  const nameMatch = content.match(/<command-name>([^<]+)<\/command-name>/);
  const argsMatch = content.match(/<command-args>([^<]*)<\/command-args>/);
  if (!nameMatch) return null;
  return {
    commandName: nameMatch[1]!,
    commandArgs: argsMatch?.[1] ?? "",
  };
}

export function parseCommandOutput(
  content: string,
): { stdout?: string; stderr?: string } | null {
  const stdoutMatch = content.match(
    /<local-command-stdout>([\s\S]*?)<\/local-command-stdout>/,
  );
  const stderrMatch = content.match(
    /<local-command-stderr>([\s\S]*?)<\/local-command-stderr>/,
  );
  if (!stdoutMatch && !stderrMatch) return null;
  return {
    stdout: stdoutMatch?.[1],
    stderr: stderrMatch?.[1],
  };
}

export function stripAnsi(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "");
}

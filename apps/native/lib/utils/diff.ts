import type { StructuredPatch } from '@/lib/types/session';

/**
 * Parse a raw unified diff string into StructuredPatch array
 * for use with DiffView component
 */
export function parseDiffToPatches(diff: string | null): StructuredPatch[] {
  if (!diff) return [];

  const patches: StructuredPatch[] = [];
  const lines = diff.split('\n');
  let currentPatch: StructuredPatch | null = null;

  for (const line of lines) {
    // Match hunk header: @@ -oldStart,oldLines +newStart,newLines @@
    const hunkMatch = line.match(/^@@ -(\d+),?(\d*) \+(\d+),?(\d*) @@/);

    if (hunkMatch) {
      // Save previous patch if exists
      if (currentPatch) {
        patches.push(currentPatch);
      }

      // Start new patch
      currentPatch = {
        oldStart: parseInt(hunkMatch[1], 10),
        oldLines: parseInt(hunkMatch[2] || '1', 10),
        newStart: parseInt(hunkMatch[3], 10),
        newLines: parseInt(hunkMatch[4] || '1', 10),
        lines: [],
      };
    } else if (currentPatch) {
      // Add line to current patch (skip file headers like --- and +++)
      if (!line.startsWith('---') && !line.startsWith('+++')) {
        currentPatch.lines.push(line);
      }
    }
  }

  // Don't forget the last patch
  if (currentPatch) {
    patches.push(currentPatch);
  }

  return patches;
}

/**
 * Count additions and deletions in a raw diff string
 */
export function countDiffChanges(diff: string | null): {
  additions: number;
  deletions: number;
} {
  if (!diff) return { additions: 0, deletions: 0 };

  const lines = diff.split('\n');
  let additions = 0;
  let deletions = 0;

  for (const line of lines) {
    if (line.startsWith('+') && !line.startsWith('+++')) {
      additions++;
    } else if (line.startsWith('-') && !line.startsWith('---')) {
      deletions++;
    }
  }

  return { additions, deletions };
}

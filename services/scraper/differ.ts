import type { DiffResult } from './types';

/**
 * Compute diff between current and previous content
 */
export function computeDiff(current: string, previous: string): DiffResult {
  // Handle first-time scrape
  if (!previous || previous.trim() === '') {
    return {
      hasChanges: true,
      changes: 'Initial scrape - no previous content to compare',
      significantChange: true,
    };
  }

  // Normalize content for comparison
  const normalizedCurrent = normalizeForComparison(current);
  const normalizedPrevious = normalizeForComparison(previous);

  // Quick equality check
  if (normalizedCurrent === normalizedPrevious) {
    return {
      hasChanges: false,
      changes: 'No changes detected',
      significantChange: false,
    };
  }

  // Compute line-level diff
  const currentLines = new Set(normalizedCurrent.split('\n').filter(Boolean));
  const previousLines = new Set(normalizedPrevious.split('\n').filter(Boolean));

  const added: string[] = [];
  const removed: string[] = [];

  // Find added lines
  currentLines.forEach((line) => {
    if (!previousLines.has(line)) {
      added.push(line);
    }
  });

  // Find removed lines
  previousLines.forEach((line) => {
    if (!currentLines.has(line)) {
      removed.push(line);
    }
  });

  // Determine significance
  const significantChange = isSignificantChange(added, removed);

  return {
    hasChanges: true,
    changes: formatDiffSummary(added, removed),
    addedContent: added.length > 0 ? added.join('\n') : undefined,
    removedContent: removed.length > 0 ? removed.join('\n') : undefined,
    significantChange,
  };
}

/**
 * Normalize content for comparison (ignore minor variations)
 */
function normalizeForComparison(content: string): string {
  return content
    .toLowerCase()
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    // Normalize times (to avoid false positives from time changes)
    .replace(/\d{1,2}:\d{2}(:\d{2})?\s*(am|pm)?/gi, '[TIME]')
    // Normalize dates
    .replace(/\d{1,2}\/\d{1,2}\/\d{2,4}/g, '[DATE]')
    .replace(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2}/gi, '[DATE]')
    // Normalize years
    .replace(/\b20\d{2}\b/g, '[YEAR]')
    .trim();
}

/**
 * Determine if changes are significant (affect availability)
 */
function isSignificantChange(added: string[], removed: string[]): boolean {
  const significantKeywords = [
    'available',
    'unavailable',
    'no appointment',
    'fully booked',
    'sold out',
    'book now',
    'schedule',
    'select a time',
    'select a date',
    'next available',
    'waitlist',
    'closed',
    'open',
    'slot',
    'opening',
  ];

  const allChanges = [...added, ...removed].join(' ').toLowerCase();

  return significantKeywords.some((keyword) => allChanges.includes(keyword));
}

/**
 * Format diff summary for human readability
 */
function formatDiffSummary(added: string[], removed: string[]): string {
  const parts: string[] = [];

  if (added.length > 0) {
    const preview = added
      .slice(0, 2)
      .map((s) => `"${truncate(s, 50)}"`)
      .join(', ');
    parts.push(`+${added.length} added: ${preview}${added.length > 2 ? '...' : ''}`);
  }

  if (removed.length > 0) {
    const preview = removed
      .slice(0, 2)
      .map((s) => `"${truncate(s, 50)}"`)
      .join(', ');
    parts.push(`-${removed.length} removed: ${preview}${removed.length > 2 ? '...' : ''}`);
  }

  return parts.join('; ') || 'Minor changes detected';
}

/**
 * Truncate string with ellipsis
 */
function truncate(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - 3) + '...';
}

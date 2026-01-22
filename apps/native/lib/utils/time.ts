import {
  differenceInMinutes,
  differenceInHours,
  differenceInDays,
  differenceInWeeks,
  differenceInMonths,
} from 'date-fns';

export function formatRelativeTimeShort(date: Date | string): string {
  const now = new Date();
  const d = typeof date === 'string' ? new Date(date) : date;

  const mins = differenceInMinutes(now, d);
  if (mins <= 1) return 'now';

  const hours = differenceInHours(now, d);
  if (hours < 1) return `${mins}m ago`;

  const days = differenceInDays(now, d);
  if (days < 1) return `${hours}h ago`;

  const weeks = differenceInWeeks(now, d);
  if (weeks < 1) return `${days}d ago`;

  const months = differenceInMonths(now, d);
  if (months < 1) return `${weeks}w ago`;

  return `${months}mo ago`;
}

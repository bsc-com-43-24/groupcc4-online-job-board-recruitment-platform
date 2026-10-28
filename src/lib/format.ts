const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const;

/**
 * Deterministic formatting helpers.
 *
 * `toLocaleString` is avoided on purpose: server and client can resolve
 * different default locales, which produces hydration mismatches.
 */

export function formatNumber(value: number): string {
  const rounded = Math.round(value);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function formatSalary(
  currency: string,
  min: number,
  max: number,
): string {
  if (!min && !max) {
    return 'Salary not disclosed';
  }
  if (!max || min === max) {
    return `${currency} ${formatNumber(min)} / month`;
  }
  return `${currency} ${formatNumber(min)} – ${formatNumber(max)} / month`;
}

/** Formats a `yyyy-mm-dd` string as e.g. `15 Nov 2026`. */
export function formatDate(iso: string | undefined): string {
  if (!iso) {
    return '—';
  }

  const parts = iso.slice(0, 10).split('-');
  if (parts.length !== 3) {
    return iso;
  }

  const [year, month, day] = parts;
  const monthIndex = Number(month) - 1;

  if (Number.isNaN(Number(year)) || Number.isNaN(Number(day)) || !MONTHS[monthIndex]) {
    return iso;
  }

  return `${Number(day)} ${MONTHS[monthIndex]} ${year}`;
}

/** Whole days from today until an ISO date. Negative means the date has passed. */
export function daysUntil(iso: string | undefined): number {
  if (!iso) {
    return 0;
  }

  const target = Date.parse(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(target)) {
    return 0;
  }

  const now = new Date();
  const todayUtc = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((target - todayUtc) / 86_400_000);
}

export function isDeadlinePassed(iso: string | undefined): boolean {
  return daysUntil(iso) < 0;
}

export function deadlineLabel(iso: string | undefined): string {
  if (!iso) {
    return 'No deadline';
  }

  const days = daysUntil(iso);

  if (days < 0) {
    return 'Closed';
  }
  if (days === 0) {
    return 'Closes today';
  }
  if (days === 1) {
    return 'Closes tomorrow';
  }
  if (days <= 14) {
    return `Closes in ${days} days`;
  }
  return `Closes ${formatDate(iso)}`;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(0)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

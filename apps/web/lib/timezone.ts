import { formatInTimeZone, toZonedTime } from 'date-fns-tz';

/**
 * Format a date in a specific timezone
 */
export function formatDateInTimezone(
  date: Date,
  timezone: string,
  formatString: string = 'PPpp',
): string {
  return formatInTimeZone(date, timezone, formatString);
}

/**
 * Convert a date to a specific timezone
 */
export function convertToTimezone(date: Date, timezone: string): Date {
  return toZonedTime(date, timezone);
}

/**
 * Get the current time in a specific timezone
 */
export function getCurrentTimeInTimezone(timezone: string): Date {
  return toZonedTime(new Date(), timezone);
}

/**
 * Format timezone for display (e.g., "GMT +07:00 Bangkok")
 */
export function formatTimezoneForDisplay(timezone: string): string {
  const now = new Date();
  const offset = formatInTimeZone(now, timezone, 'XXX'); // "+07:00"
  const cityName = timezone.split('/')[1]?.replace(/_/g, ' '); // "Bangkok"

  return `GMT ${offset} ${cityName || timezone}`;
}

/**
 * Get the user's browser timezone
 */
export function getBrowserTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Common timezones for selection
 */
export const COMMON_TIMEZONES = [
  { label: 'GMT +00:00 London', value: 'Europe/London' },
  { label: 'GMT +01:00 Paris, Berlin', value: 'Europe/Paris' },
  { label: 'GMT +02:00 Cairo, Athens', value: 'Africa/Cairo' },
  { label: 'GMT +03:00 Moscow, Istanbul', value: 'Europe/Moscow' },
  { label: 'GMT +04:00 Dubai', value: 'Asia/Dubai' },
  { label: 'GMT +05:00 Karachi', value: 'Asia/Karachi' },
  { label: 'GMT +05:30 Mumbai, Delhi', value: 'Asia/Kolkata' },
  { label: 'GMT +06:00 Dhaka', value: 'Asia/Dhaka' },
  { label: 'GMT +07:00 Bangkok, Ha Noi, Jakarta', value: 'Asia/Bangkok' },
  { label: 'GMT +08:00 Singapore, Kuala Lumpur', value: 'Asia/Singapore' },
  { label: 'GMT +08:00 Hong Kong, Beijing', value: 'Asia/Hong_Kong' },
  { label: 'GMT +09:00 Tokyo, Seoul', value: 'Asia/Tokyo' },
  { label: 'GMT +10:00 Sydney', value: 'Australia/Sydney' },
  { label: 'GMT +12:00 Auckland', value: 'Pacific/Auckland' },
  { label: 'GMT -05:00 New York', value: 'America/New_York' },
  { label: 'GMT -06:00 Chicago', value: 'America/Chicago' },
  { label: 'GMT -07:00 Denver', value: 'America/Denver' },
  { label: 'GMT -08:00 Los Angeles', value: 'America/Los_Angeles' },
  { label: 'GMT -03:00 São Paulo', value: 'America/Sao_Paulo' },
  { label: 'UTC', value: 'UTC' },
];

/**
 * Compare times across different timezones
 */
export function compareTimezones(
  date: Date,
  timezones: string[],
): Array<{ timezone: string; time: string; offset: string }> {
  return timezones.map((tz) => ({
    timezone: tz,
    time: formatInTimeZone(date, tz, 'PPpp'),
    offset: formatInTimeZone(date, tz, 'XXX'),
  }));
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/** API timestamps are wall-clock strings, so they are formatted, never re-parsed into a Date. */
export function formatDateTime(value) {
  if (!value) return '';
  const [date, time] = value.split('T');
  return `${formatDate(date)}, ${time.slice(0, 5)}`;
}

/** Accepts either a date-only string or a full timestamp. */
export function formatDate(value) {
  if (!value) return '';
  const [year, month, day] = value.split('T')[0].split('-');
  return `${Number(day)} ${MONTHS[Number(month) - 1]} ${year}`;
}

export function formatTime(value) {
  return value ? value.split('T')[1].slice(0, 5) : '';
}

export function todayIso() {
  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

export const SPACE_TYPE_LABELS = {
  desk: 'Desk',
  meeting_room: 'Meeting room',
};

export const SPACE_TYPE_ICONS = {
  desk: 'ph-desktop',
  meeting_room: 'ph-door',
};

/** "2 hours", "45 minutes" - shown next to the booking form. */
export function formatDuration(startTime, endTime) {
  if (!startTime || !endTime) return null;

  const toMinutes = (value) => {
    const [hours, minutes] = value.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const total = toMinutes(endTime) - toMinutes(startTime);
  if (total <= 0) return null;

  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  const parts = [];
  if (hours > 0) parts.push(`${hours} hour${hours === 1 ? '' : 's'}`);
  if (minutes > 0) parts.push(`${minutes} min`);
  return parts.join(' ');
}

/** Minutes since midnight, used to place blocks on the availability timeline. */
export function minutesFromMidnight(timestamp) {
  const [hours, minutes] = timestamp.split('T')[1].split(':').map(Number);
  return hours * 60 + minutes;
}

export function resolveImageUrl(url) {
  if (!url) return '';
  if (
    url.startsWith('http://') ||
    url.startsWith('https://') ||
    url.startsWith('data:') ||
    url.startsWith('blob:')
  ) {
    return url;
  }
  if (url.startsWith('/uploads/')) {
    const apiOrigin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:4000';
    return `${apiOrigin}${url}`;
  }
  return url;
}
